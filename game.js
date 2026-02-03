// Инициализация игры
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const levelDisplay = document.getElementById('level');
const healthDisplay = document.getElementById('health');
const enemiesDisplay = document.getElementById('enemies');
const levelInfo = document.getElementById('levelInfo');

// Константы игры
const GRAVITY = 0.5;
const PLAYER_SPEED = 5;
const JUMP_FORCE = -12;
const SUPER_JUMP_FORCE = -18;
const ENEMY_SPEED = 2;

// Уровни игры
const levels = [
    { // Уровень 1: Обучение
        platforms: [
            {x: 0, y: 450, width: 300, height: 30},
            {x: 350, y: 400, width: 200, height: 30},
            {x: 600, y: 350, width: 200, height: 30},
            {x: 0, y: 250, width: 200, height: 30},
            {x: 400, y: 200, width: 200, height: 30},
            {x: 650, y: 150, width: 150, height: 30}
        ],
        enemies: [
            {x: 500, y: 370, width: 40, height: 60, dir: 1}
        ],
        start: {x: 50, y: 400},
        exit: {x: 700, y: 120, width: 50, height: 30},
        message: "Уровень 1: Научитесь прыгать! Используйте присед+прыжок для высоких платформ."
    },
    { // Уровень 2: Добавляем врагов
        platforms: [
            {x: 0, y: 450, width: 200, height: 30},
            {x: 250, y: 400, width: 150, height: 30},
            {x: 450, y: 350, width: 150, height: 30},
            {x: 650, y: 300, width: 150, height: 30},
            {x: 300, y: 250, width: 200, height: 30},
            {x: 100, y: 200, width: 150, height: 30},
            {x: 550, y: 150, width: 150, height: 30}
        ],
        enemies: [
            {x: 300, y: 370, width: 40, height: 60, dir: 1},
            {x: 600, y: 290, width: 40, height: 60, dir: -1}
        ],
        start: {x: 50, y: 420},
        exit: {x: 580, y: 120, width: 50, height: 30},
        message: "Уровень 2: Атакуйте врагов мечом (X)! Избегайте их касания."
    },
    { // Уровень 3: Сложные прыжки
        platforms: [
            {x: 0, y: 450, width: 100, height: 30},
            {x: 150, y: 380, width: 100, height: 30},
            {x: 300, y: 310, width: 100, height: 30},
            {x: 450, y: 240, width: 100, height: 30},
            {x: 600, y: 170, width: 100, height: 30},
            {x: 0, y: 100, width: 100, height: 30}
        ],
        enemies: [
            {x: 180, y: 330, width: 40, height: 60, dir: 1},
            {x: 480, y: 190, width: 40, height: 60, dir: -1}
        ],
        start: {x: 50, y: 420},
        exit: {x: 30, y: 70, width: 50, height: 30},
        message: "Уровень 3: Требуется мастерство прыжков! Только супер-прыжки помогут."
    },
    { // Уровень 4: Движущиеся платформы
        platforms: [
            {x: 0, y: 450, width: 200, height: 30, moving: false},
            {x: 250, y: 400, width: 100, height: 30, moving: true, dirX: 1, speed: 2},
            {x: 500, y: 350, width: 100, height: 30, moving: true, dirX: -1, speed: 3},
            {x: 200, y: 280, width: 100, height: 30, moving: true, dirX: 1, speed: 1.5},
            {x: 450, y: 210, width: 100, height: 30, moving: false},
            {x: 650, y: 140, width: 150, height: 30, moving: false}
        ],
        enemies: [
            {x: 270, y: 340, width: 40, height: 60, dir: 1},
            {x: 520, y: 290, width: 40, height: 60, dir: -1},
            {x: 220, y: 220, width: 40, height: 60, dir: 1}
        ],
        start: {x: 50, y: 420},
        exit: {x: 680, y: 110, width: 50, height: 30},
        message: "Уровень 4: Движущиеся платформы! Рассчитывайте прыжки."
    },
    { // Уровень 5: Финальный босс
        platforms: [
            {x: 0, y: 450, width: 150, height: 30},
            {x: 200, y: 380, width: 150, height: 30},
            {x: 400, y: 310, width: 150, height: 30},
            {x: 600, y: 240, width: 200, height: 30},
            {x: 300, y: 170, width: 100, height: 30},
            {x: 100, y: 100, width: 100, height: 30},
            {x: 500, y: 100, width: 100, height: 30}
        ],
        enemies: [
            {x: 250, y: 330, width: 40, height: 60, dir: 1},
            {x: 450, y: 260, width: 40, height: 60, dir: -1},
            {x: 320, y: 120, width: 60, height: 80, dir: 1, isBoss: true, health: 3}
        ],
        start: {x: 50, y: 420},
        exit: {x: 550, y: 70, width: 50, height: 30},
        message: "Уровень 5: ФИНАЛ! Победите босса-ниндзя! У него 3 жизни."
    }
];

// Игровые объекты
let player = {
    x: 50,
    y: 400,
    width: 40,
    height: 60,
    speedX: 0,
    speedY: 0,
    isGrounded: false,
    isCrouching: false,
    isAttacking: false,
    attackTimer: 0,
    health: 100,
    facing: 1 // 1 = вправо, -1 = влево
};

let currentLevel = 0;
let platforms = [];
let enemies = [];
let exit = {};
let gameRunning = false;
let gamePaused = false;
let keys = {};
let score = 0;
let superJumpReady = false;

// Управление
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        e.preventDefault(); // Предотвращаем прокрутку страницы
    }
    
    // Приседание
    if (e.key === 'ArrowDown' && player.isGrounded) {
        player.isCrouching = true;
        player.height = 40;
        superJumpReady = true;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    
    if (e.key === 'ArrowDown') {
        player.isCrouching = false;
        player.height = 60;
    }
});

// Кнопки управления
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetLevel);

// Функции игры
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        loadLevel(currentLevel);
        gameLoop();
        startBtn.textContent = "Перезапуск";
    } else {
        resetLevel();
    }
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? "Продолжить" : "Пауза";
    }
}

function resetLevel() {
    loadLevel(currentLevel);
    gamePaused = false;
    pauseBtn.textContent = "Пауза";
}

function loadLevel(levelIndex) {
    currentLevel = levelIndex;
    const level = levels[levelIndex];
    
    // Сброс игрока
    player.x = level.start.x;
    player.y = level.start.y;
    player.speedX = 0;
    player.speedY = 0;
    player.health = 100;
    player.isCrouching = false;
    player.height = 60;
    
    // Загрузка уровня
    platforms = level.platforms.map(p => ({...p}));
    enemies = level.enemies.map(e => ({...e, originalX: e.x}));
    exit = {...level.exit};
    
    // Обновление UI
    levelDisplay.textContent = currentLevel + 1;
    healthDisplay.textContent = player.health;
    enemiesDisplay.textContent = enemies.length;
    
    // Сообщение уровня
    levelInfo.innerHTML = `<h2>Уровень ${currentLevel + 1}: ${level.message.split(':')[0]}</h2>
                          <p>${level.message.split(':')[1]}</p>`;
}

function update() {
    if (gamePaused || !gameRunning) return;
    
    // Движение игрока
    player.speedX = 0;
    
    if (keys['arrowleft'] || keys['a']) {
        player.speedX = -PLAYER_SPEED;
        player.facing = -1;
    }
    if (keys['arrowright'] || keys['d']) {
        player.speedX = PLAYER_SPEED;
        player.facing = 1;
    }
    
    // Прыжок
    if ((keys['arrowup'] || keys['w'] || keys[' ']) && player.isGrounded) {
        if (superJumpReady && player.isCrouching) {
            player.speedY = SUPER_JUMP_FORCE;
            showEffect(player.x + 20, player.y + 60, "✨ СУПЕР-ПРЫЖОК!");
            superJumpReady = false;
        } else {
            player.speedY = JUMP_FORCE;
        }
        player.isGrounded = false;
    }
    
    // Атака
    if (keys['x'] && !player.isAttacking) {
        player.isAttacking = true;
        player.attackTimer = 15;
        
        // Проверка попадания
        const attackRange = 50;
        enemies.forEach(enemy => {
            if (Math.abs(player.x - enemy.x) < attackRange && 
                Math.abs(player.y - enemy.y) < 40) {
                if (enemy.isBoss) {
                    enemy.health--;
                    showEffect(enemy.x + 20, enemy.y - 20, "💥 " + enemy.health);
                    if (enemy.health <= 0) {
                        enemies = enemies.filter(e => e !== enemy);
                    }
                } else {
                    enemies = enemies.filter(e => e !== enemy);
                    showEffect(enemy.x + 20, enemy.y - 20, "💥 УБИТ!");
                    score += 100;
                }
                enemiesDisplay.textContent = enemies.length;
            }
        });
    }
    
    // Таймер атаки
    if (player.isAttacking) {
        player.attackTimer--;
        if (player.attackTimer <= 0) {
            player.isAttacking = false;
        }
    }
    
    // Физика
    player.speedY += GRAVITY;
    player.x += player.speedX;
    player.y += player.speedY;
    
    // Границы экрана
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    if (player.y > canvas.height) {
        player.health -= 20;
        healthDisplay.textContent = player.health;
        if (player.health <= 0) {
            gameOver();
            return;
        }
        player.x = levels[currentLevel].start.x;
        player.y = levels[currentLevel].start.y;
        player.speedY = 0;
    }
    
    // Коллизии с платформами
    player.isGrounded = false;
    platforms.forEach(platform => {
        // Движение платформы
        if (platform.moving) {
            platform.x += platform.dirX * platform.speed;
            if (platform.x < 0 || platform.x + platform.width > canvas.width) {
                platform.dirX *= -1;
            }
        }
        
        // Коллизия
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + 20 &&
            player.speedY > 0) {
            
            player.y = platform.y - player.height;
            player.speedY = 0;
            player.isGrounded = true;
            superJumpReady = false;
        }
    });
    
    // Обновление врагов
    enemies.forEach(enemy => {
        // Движение
        enemy.x += enemy.dir * ENEMY_SPEED;
        
        // Поворот у края платформы
        let onPlatform = platforms.some(p => 
            enemy.x > p.x - 20 && 
            enemy.x < p.x + p.width - enemy.width + 20 &&
            Math.abs(enemy.y + enemy.height - p.y) < 5
        );
        
        if (!onPlatform || enemy.x < 20 || enemy.x > canvas.width - enemy.width - 20) {
            enemy.dir *= -1;
        }
        
        // Коллизия с игроком
        if (Math.abs(player.x - enemy.x) < player.width/2 + enemy.width/2 &&
            Math.abs(player.y - enemy.y) < player.height/2 + enemy.height/2 &&
            !player.isAttacking) {
            
            player.health -= 10;
            healthDisplay.textContent = player.health;
            
            // Отталкивание
            player.speedX = enemy.dir * 10;
            player.speedY = -5;
            
            if (player.health <= 0) {
                gameOver();
            }
        }
    });
    
    // Проверка выхода
    if (player.x < exit.x + exit.width &&
        player.x + player.width > exit.x &&
        player.y < exit.y + exit.height &&
        player.y + player.height > exit.y) {
        
        if (currentLevel < levels.length - 1) {
            currentLevel++;
            loadLevel(currentLevel);
            showEffect(canvas.width/2, canvas.height/2, "🎉 УРОВЕНЬ ПРОЙДЕН!");
        } else {
            gameWin();
        }
    }
}

function draw() {
    // Очистка экрана
    ctx.fillStyle = '#1e3d28';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Фон джунглей
    drawJungleBackground();
    
    // Платформы
    platforms.forEach(platform => {
        ctx.fillStyle = platform.moving ? '#8b4513' : '#654321';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Текстура дерева
        ctx.fillStyle = platform.moving ? '#a0522d' : '#8b4513';
        for (let i = 0; i < platform.width; i += 20) {
            ctx.fillRect(platform.x + i, platform.y, 10, 5);
        }
    });
    
    // Враги
    enemies.forEach(enemy => {
        // Тело ниндзя
        ctx.fillStyle = enemy.isBoss ? '#8b0000' : '#333';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Голова
        ctx.fillStyle = '#222';
        ctx.fillRect(enemy.x + 10, enemy.y - 10, enemy.width - 20, 10);
        
        // Глаза
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x + 15, enemy.y - 5, 5, 5);
        ctx.fillRect(enemy.x + enemy.width - 20, enemy.y - 5, 5, 5);
        
        // Меч
        ctx.fillStyle = '#666';
        ctx.fillRect(enemy.x + (enemy.dir > 0 ? enemy.width : -10), enemy.y + 20, 15, 5);
    });
    
    // Игрок
    drawPlayer();
    
    // Выход
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('ВЫХОД', exit.x + 5, exit.y + 20);
    
    // Эффекты
    drawEffects();
    
    // UI
    drawUI();
}

function drawPlayer() {
    // Тело воина
    ctx.fillStyle = player.isAttacking ? '#ff9900' : '#2a4b8c';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Шлем/голова
    ctx.fillStyle = '#1a3b7a';
    ctx.fillRect(player.x + 10, player.y - 10, player.width - 20, 15);
    
    // Меч при атаке
    if (player.isAttacking) {
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(
            player.x + (player.facing > 0 ? player.width : -30),
            player.y + 20,
            30, 5
        );
    }
    
    // Индикатор супер-прыжка
    if (superJumpReady) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y - 10, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawJungleBackground() {
    // Небо
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#1e3d28');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Деревья на заднем плане
    ctx.fillStyle = 'rgba(0, 50, 0, 0.3)';
    for (let i = 0; i < 5; i++) {
        const x = (i * 200) % canvas.width;
        ctx.fillRect(x, 200, 40, 300);
    }
    
    // Листья
    ctx.fillStyle = 'rgba(0, 100, 0, 0.4)';
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * 200;
        const size = Math.random() * 30 + 20;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawUI() {
    // Полоска здоровья
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(20, 20, 200, 20);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(20, 20, player.health * 2, 20);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(20, 20, 200, 20);
    
    // Текст
    ctx.fillStyle = '#fff';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText(`Уровень: ${currentLevel + 1}`, 250, 35);
    ctx.fillText(`Врагов: ${enemies.length}`, 450, 35);
    ctx.fillText(`Очки: ${score}`, 620, 35);
    
    // Инструкция
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width/2 - 150, canvas.height/2 - 50, 300, 100);
        ctx.fillStyle = '#ffd700';
        ctx.font = '20px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('НАЖМИТЕ "НАЧАТЬ"', canvas.width/2, canvas.height/2);
        ctx.font = '12px "Press Start 2P"';
        ctx.fillText('для старта игры', canvas.width/2, canvas.height/2 + 30);
        ctx.textAlign = 'left';
    }
    
    if (gamePaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width/2 - 100, canvas.height/2 - 25, 200, 50);
        ctx.fillStyle = '#ff0000';
        ctx.font = '20px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('ПАУЗА', canvas.width/2, canvas.height/2);
        ctx.textAlign = 'left';
    }
}

let effects = [];

function showEffect(x, y, text) {
    effects.push({
        x: x,
        y: y,
        text: text,
        timer: 60,
        alpha: 1
    });
}

function drawEffects() {
    for (let i = effects.length - 1; i >= 0; i--) {
        const effect = effects[i];
        ctx.globalAlpha = effect.alpha;
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(effect.text, effect.x, effect.y);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
        
        effect.y -= 1;
        effect.timer--;
        effect.alpha = effect.timer / 60;
        
        if (effect.timer <= 0) {
            effects.splice(i, 1);
        }
    }
}

function gameOver() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(canvas.width/2 - 150, canvas.height/2 - 50, 300, 100);
    ctx.fillStyle = '#ff0000';
    ctx.font = '20px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('ИГРА ОКОНЧЕНА', canvas.width/2, canvas.height/2 - 10);
    ctx.font = '14px "Press Start 2P"';
    ctx.fillText(`Очки: ${score}`, canvas.width/2, canvas.height/2 + 30);
    ctx.textAlign = 'left';
}

function gameWin() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 100, 0, 0.8)';
    ctx.fillRect(canvas.width/2 - 150, canvas.height/2 - 50, 300, 100);
    ctx.fillStyle = '#ffd700';
    ctx.font = '20px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('ПОБЕДА!', canvas.width/2, canvas.height/2 - 10);
    ctx.font = '14px "Press Start 2P"';
    ctx.fillText(`Финальный счет: ${score}`, canvas.width/2, canvas.height/2 + 30);
    ctx.textAlign = 'left';
}

// Игровой цикл
function gameLoop() {
    update();
    draw();
    
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Начальная загрузка
loadLevel(0);
draw();