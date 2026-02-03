// Инициализация игры
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const soundBtn = document.getElementById('soundBtn');
const levelDisplay = document.getElementById('level');
const healthDisplay = document.getElementById('health');
const enemiesDisplay = document.getElementById('enemies');
const levelInfo = document.getElementById('levelInfo');

// Звуковые элементы
const bgMusic = document.getElementById('bgMusic');
const swordSound = document.getElementById('swordSound');
const jumpSound = document.getElementById('jumpSound');
const hitSound = document.getElementById('hitSound');

// Настройки звука
let soundEnabled = true;
bgMusic.volume = 0.3;
swordSound.volume = 0.5;
jumpSound.volume = 0.3;
hitSound.volume = 0.4;

// Константы игры
const GRAVITY = 0.5;
const PLAYER_SPEED = 5;
const JUMP_FORCE = -12;
const SUPER_JUMP_FORCE = -20;
const ENEMY_SPEED = 2;

// Текстуры (простой пиксель-арт)
const textures = {
    player: {
        body: '#2a4b8c',
        helmet: '#1a3b7a',
        skin: '#ffcc99',
        sword: '#cccccc'
    },
    enemy: {
        body: '#333333',
        head: '#222222',
        eyes: '#ff0000',
        sword: '#666666'
    },
    boss: {
        body: '#8b0000',
        head: '#660000',
        eyes: '#ff5500',
        sword: '#888888'
    },
    platform: '#654321',
    movingPlatform: '#8b4513'
};

// Уровни игры (ИСПРАВЛЕН 2-й уровень!)
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
            {x: 500, y: 370 - 60, width: 40, height: 60, dir: 1} // Исправлен спавн
        ],
        start: {x: 50, y: 400},
        exit: {x: 700, y: 120, width: 50, height: 30},
        message: "Уровень 1: Научитесь прыгать! Присед+Прыжок для высоких платформ."
    },
    { // Уровень 2: С исправленным спавном!
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
            {x: 300, y: 370 - 60, width: 40, height: 60, dir: 1}, // Исправлено: было 370, стало 370-60
            {x: 600, y: 290 - 60, width: 40, height: 60, dir: -1}  // Исправлено: было 290, стало 290-60
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
            {x: 180, y: 330 - 60, width: 40, height: 60, dir: 1},
            {x: 480, y: 190 - 60, width: 40, height: 60, dir: -1}
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
            {x: 270, y: 340 - 60, width: 40, height: 60, dir: 1},
            {x: 520, y: 290 - 60, width: 40, height: 60, dir: -1},
            {x: 220, y: 220 - 60, width: 40, height: 60, dir: 1}
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
            {x: 250, y: 330 - 60, width: 40, height: 60, dir: 1},
            {x: 450, y: 260 - 60, width: 40, height: 60, dir: -1},
            {x: 320, y: 120 - 80, width: 60, height: 80, dir: 1, isBoss: true, health: 3}
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
    attackProgress: 0,
    health: 100,
    facing: 1,
    canSuperJump: false,
    superJumpCharged: false
};

let currentLevel = 0;
let platforms = [];
let enemies = [];
let exit = {};
let gameRunning = false;
let gamePaused = false;
let keys = {};
let score = 0;
let effects = [];

// Управление
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = true;
    
    if (key === ' ') {
        e.preventDefault();
    }
    
    // Приседание для супер-прыжка
    if (key === 'arrowdown' || key === 's') {
        player.isCrouching = true;
        player.height = 40;
        player.canSuperJump = true;
    }
    
    // Прыжок
    if ((key === 'arrowup' || key === 'w' || key === ' ') && player.isGrounded) {
        if (player.canSuperJump && player.isCrouching) {
            player.superJumpCharged = true;
        } else {
            player.speedY = JUMP_FORCE;
            player.isGrounded = false;
            if (soundEnabled) {
                jumpSound.currentTime = 0;
                jumpSound.play();
            }
        }
    }
    
    // Атака
    if (key === 'x' && !player.isAttacking) {
        player.isAttacking = true;
        player.attackTimer = 20;
        player.attackProgress = 0;
        
        if (soundEnabled) {
            swordSound.currentTime = 0;
            swordSound.play();
        }
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    keys[key] = false;
    
    // Супер-прыжок: отпускаем присед после прыжка
    if ((key === 'arrowdown' || key === 's') && player.superJumpCharged) {
        player.speedY = SUPER_JUMP_FORCE;
        player.isGrounded = false;
        player.superJumpCharged = false;
        player.canSuperJump = false;
        player.isCrouching = false;
        player.height = 60;
        
        showEffect(player.x + 20, player.y + 60, "✨ СУПЕР-ПРЫЖОК!");
        
        if (soundEnabled) {
            jumpSound.currentTime = 0;
            jumpSound.volume = 0.5;
            jumpSound.play();
        }
    }
    
    // Отмена приседания
    if (key === 'arrowdown' || key === 's') {
        if (!player.superJumpCharged) {
            player.isCrouching = false;
            player.height = 60;
            player.canSuperJump = false;
        }
    }
});

// Кнопки управления
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
soundBtn.addEventListener('click', toggleSound);

function toggleSound() {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? "🔊 Звук" : "🔇 Выкл";
    
    if (soundEnabled) {
        bgMusic.play().catch(e => console.log("Автовоспроизведение заблокировано"));
    } else {
        bgMusic.pause();
    }
}

// Функции игры
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        loadLevel(currentLevel);
        gameLoop();
        startBtn.textContent = "Перезапуск";
        
        // Запуск музыки
        if (soundEnabled) {
            bgMusic.play().catch(e => console.log("Автовоспроизведение заблокировано"));
        }
    } else {
        resetLevel();
    }
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? "Продолжить" : "Пауза";
        
        if (gamePaused) {
            bgMusic.pause();
        } else if (soundEnabled) {
            bgMusic.play();
        }
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
    player.canSuperJump = false;
    player.superJumpCharged = false;
    
    // Загрузка уровня
    platforms = level.platforms.map(p => ({...p}));
    enemies = level.enemies.map(e => ({...e, originalX: e.x}));
    exit = {...level.exit};
    
    // Обновление UI
    levelDisplay.textContent = currentLevel + 1;
    healthDisplay.textContent = player.health;
    enemiesDisplay.textContent = enemies.length;
    
    // Сообщение уровня
    levelInfo.innerHTML = `<h2>Уровень ${currentLevel + 1}</h2>
                          <p>${level.message}</p>`;
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
    
    // Обычный прыжок (если не заряжен супер-прыжок)
    if ((keys['arrowup'] || keys['w'] || keys[' ']) && player.isGrounded && !player.superJumpCharged) {
        player.speedY = JUMP_FORCE;
        player.isGrounded = false;
        if (soundEnabled) {
            jumpSound.currentTime = 0;
            jumpSound.play();
        }
    }
    
    // Анимация атаки
    if (player.isAttacking) {
        player.attackTimer--;
        player.attackProgress = (20 - player.attackTimer) / 20;
        
        // Проверка попадания в середине анимации
        if (player.attackTimer === 15) {
            const attackRange = 70; // Увеличенная дальность атаки
            const attackWidth = 40;
            const attackHeight = 30;
            
            enemies.forEach(enemy => {
                const attackX = player.x + (player.facing > 0 ? player.width : -attackWidth);
                const attackY = player.y + 20;
                
                if (attackX < enemy.x + enemy.width &&
                    attackX + attackWidth > enemy.x &&
                    attackY < enemy.y + enemy.height &&
                    attackY + attackHeight > enemy.y) {
                    
                    if (enemy.isBoss) {
                        enemy.health--;
                        showEffect(enemy.x + 30, enemy.y - 20, "💥 " + enemy.health);
                        if (enemy.health <= 0) {
                            enemies = enemies.filter(e => e !== enemy);
                            score += 300;
                        }
                    } else {
                        enemies = enemies.filter(e => e !== enemy);
                        showEffect(enemy.x + 20, enemy.y - 20, "💥 УБИТ!");
                        score += 100;
                    }
                    
                    if (soundEnabled) {
                        hitSound.currentTime = 0;
                        hitSound.play();
                    }
                    
                    enemiesDisplay.textContent = enemies.length;
                }
            });
        }
        
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
        if (platform.moving) {
            platform.x += platform.dirX * platform.speed;
            if (platform.x < 0 || platform.x + platform.width > canvas.width) {
                platform.dirX *= -1;
            }
        }
        
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + 20 &&
            player.speedY > 0) {
            
            player.y = platform.y - player.height;
            player.speedY = 0;
            player.isGrounded = true;
            
            // Сброс супер-прыжка при приземлении
            if (player.superJumpCharged) {
                player.superJumpCharged = false;
                player.canSuperJump = false;
                player.isCrouching = false;
                player.height = 60;
            }
        }
    });
    
    // Обновление врагов
    enemies.forEach(enemy => {
        enemy.x += enemy.dir * ENEMY_SPEED;
        
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
            
            player.speedX = enemy.dir * 10;
            player.speedY = -5;
            
            if (soundEnabled) {
                hitSound.currentTime = 0;
                hitSound.play();
            }
            
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
    
    // Обновление эффектов
    for (let i = effects.length - 1; i >= 0; i--) {
        effects[i].y -= 1;
        effects[i].timer--;
        effects[i].alpha = effects[i].timer / 60;
        
        if (effects[i].timer <= 0) {
            effects.splice(i, 1);
        }
    }
}

function draw() {
    // Очистка экрана
    ctx.fillStyle = '#1e3d28';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Статичный фон джунглей
    drawJungleBackground();
    
    // Платформы
    platforms.forEach(platform => {
        ctx.fillStyle = platform.moving ? textures.movingPlatform : textures.platform;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Текстура дерева
        ctx.fillStyle = platform.moving ? '#a0522d' : '#8b4513';
        for (let i = 0; i < platform.width; i += 20) {
            ctx.fillRect(platform.x + i, platform.y, 10, 5);
        }
    });
    
    // Враги
    enemies.forEach(enemy => {
        drawEnemy(enemy);
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

function drawJungleBackground() {
    // Небо с градиентом
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#5d8c5d');
    gradient.addColorStop(1, '#1e3d28');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Деревья на заднем плане
    ctx.fillStyle = 'rgba(0, 80, 0, 0.4)';
    for (let i = 0; i < 8; i++) {
        const x = (i * 120) % canvas.width;
        const width = 30 + Math.sin(i) * 10;
        const height = 200 + Math.cos(i * 2) * 50;
        ctx.fillRect(x, canvas.height - height, width, height);
    }
    
    // Листья
    ctx.fillStyle = 'rgba(50, 150, 50, 0.3)';
    for (let i = 0; i < 15; i++) {
        const x = (i * 80) % canvas.width;
        const y = canvas.height - 250 + Math.sin(i) * 30;
        const size = 25 + Math.cos(i) * 10;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Солнце
    ctx.fillStyle = 'rgba(255, 255, 150, 0.2)';
    ctx.beginPath();
    ctx.arc(700, 80, 40, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayer() {
    // Тело воина (пиксель-арт стиль)
    ctx.fillStyle = textures.player.body;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Голова/шлем
    ctx.fillStyle = textures.player.helmet;
    ctx.fillRect(player.x + 10, player.y - 10, player.width - 20, 15);
    
    // Лицо
    ctx.fillStyle = textures.player.skin;
    ctx.fillRect(player.x + 15, player.y - 5, 10, 8);
    
    // Глаза
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + 17, player.y - 3, 3, 3);
    ctx.fillRect(player.x + 25, player.y - 3, 3, 3);
    
    // Приседание
    if (player.isCrouching) {
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(player.x + player.width/2 - 5, player.y - 15, 10, 5);
    }
    
    // Анимация атаки мечом
    if (player.isAttacking) {
        const swingProgress = player.attackProgress;
        const angle = swingProgress * Math.PI / 2 * player.facing;
        const swordLength = 40;
        const swordWidth = 5;
        
        ctx.save();
        ctx.translate(
            player.x + (player.facing > 0 ? player.width : 0),
            player.y + 25
        );
        ctx.rotate(angle);
        
        // Меч
        ctx.fillStyle = textures.player.sword;
        ctx.fillRect(0, -swordWidth/2, swordLength, swordWidth);
        
        // Рукоятка
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(0, -swordWidth/2, 10, swordWidth);
        
        ctx.restore();
    }
    
    // Индикатор супер-прыжка
    if (player.superJumpCharged) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y - 20, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff9900';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('!', player.x + player.width/2, player.y - 18);
        ctx.textAlign = 'left';
    }
}

function drawEnemy(enemy) {
    // Тело ниндзя
    ctx.fillStyle = enemy.isBoss ? textures.boss.body : textures.enemy.body;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Голова
    ctx.fillStyle = enemy.isBoss ? textures.boss.head : textures.enemy.head;
    ctx.fillRect(enemy.x + 10, enemy.y - 10, enemy.width - 20, 15);
    
    // Маска
    ctx.fillStyle = '#111';
    ctx.fillRect(enemy.x + 12, enemy.y - 5, enemy.width - 24, 8);
    
    // Глаза
    ctx.fillStyle = enemy.isBoss ? textures.boss.eyes : textures.enemy.eyes;
    ctx.fillRect(enemy.x + 15, enemy.y - 3, 5, 5);
    ctx.fillRect(enemy.x + enemy.width - 20, enemy.y - 3, 5, 5);
    
    // Меч
    ctx.fillStyle = enemy.isBoss ? textures.boss.sword : textures.enemy.sword;
    ctx.fillRect(enemy.x + (enemy.dir > 0 ? enemy.width : -15), enemy.y + 20, 15, 4);
    
    // Здоровье босса
    if (enemy.isBoss && enemy.health > 0) {
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(enemy.x, enemy.y - 20, enemy.width, 5);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x, enemy.y - 20, enemy.width * (enemy.health / 3), 5);
    }
}

function drawEffects() {
    effects.forEach(effect => {
        ctx.globalAlpha = effect.alpha;
        ctx.fillStyle = effect.color || '#ffff00';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(effect.text, effect.x, effect.y);
        ctx.globalAlpha = 1;
    });
    ctx.textAlign = 'left';
}

function drawUI() {
    // Полоска здоровья
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(20, 20, 200, 20);
    ctx.fillStyle = player.health > 30 ? '#00ff00' : '#ff0000';
    ctx.fillRect(20, 20, player.health * 2, 20);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 200, 20);
    
    // Текст
    ctx.fillStyle = '#fff';
    ctx.font = '14px "Press Start 2P"';
    ctx.fillText(`Уровень: ${currentLevel + 1}/5`, 250, 35);
    ctx.fillText(`Врагов: ${enemies.length}`, 450, 35);
    ctx.fillText(`Очки: ${score}`, 620, 35);
    
    // Индикатор супер-прыжка
    if (player.canSuperJump) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fillRect(player.x - 5, player.y + player.height + 5, player.width + 10, 5);
    }
    
    // Инструкция
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
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
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(canvas.width/2 - 100, canvas.height/2 - 25, 200, 50);
        ctx.fillStyle = '#ff0000';
        ctx.font = '20px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('ПАУЗА', canvas.width/2, canvas.height/2);
        ctx.textAlign = 'left';
    }
}

function showEffect(x, y, text, color) {
    effects.push({
        x: x,
        y: y,
        text: text,
        color: color,
        timer: 60,
        alpha: 1
    });
}

function gameOver() {
    gameRunning = false;
    bgMusic.pause();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(canvas.width/2 - 150, canvas.height/2 - 60, 300, 120);
    ctx.fillStyle = '#ff0000';
    ctx.font = '20px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('ИГРА ОКОНЧЕНА', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '14px "Press Start 2P"';
    ctx.fillText(`Очки: ${score}`, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText('Нажмите "Начать"', canvas.width/2, canvas.height/2 + 50);
    ctx.textAlign = 'left';
}

function gameWin() {
    gameRunning = false;
    bgMusic.pause();
    
    ctx.fillStyle = 'rgba(0, 100, 0, 0.8)';
    ctx.fillRect(canvas.width/2 - 200, canvas.height/2 - 80, 400, 160);
    ctx.fillStyle = '#ffd700';
    ctx.font = '24px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 ПОБЕДА! 🎉', canvas.width/2, canvas.height/2 - 30);
    ctx.font = '18px "Press Start 2P"';
    ctx.fillText(`Финальный счет: ${score}`, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText('Все уровни пройдены!', canvas.width/2, canvas.height/2 + 50);
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
