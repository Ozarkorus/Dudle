const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

const gravity = 0.1;
const jumpStrength = -5;

let doodler = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 100,
    width: 5,
    height: 5,
    vy: 0,
    score: 0,
    distance: 7000,
    highscore: 0,
    hasJetpack: true,
    jetpackFuel: 1000000,
};

let platforms = [];
let coins = [];
let spikes = [];
const platformCount = 6;

function createPlatforms() {
    for (let i = 0; i < platformCount; i++) {
        platforms.push({
            x: Math.random() * (canvas.width - 70),
            y: canvas.height - (i + 1) * 100,
            width: 70,
            height: 10,
            type: Math.random() < 0.2 ? 'spike' : 'normal',
        });
    }
}

function createCoin(platform) {
    coins.push({
        x: platform.x + platform.width / 2 - 10,
        y: platform.y - 20,
        width: 20,
        height: 20,
    });
}

function drawDoodler() {
    ctx.fillStyle = doodler.hasJetpack ? '#FFD700' : '#00FF00';
    ctx.fillRect(doodler.x, doodler.y, doodler.width, doodler.height);

    if (doodler.hasJetpack) {
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(doodler.x + 10, doodler.y + doodler.height, 10, 20);
    }
}

function drawPlatforms() {
    platforms.forEach(platform => {
        if (platform.type === 'spike') {
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(platform.x, platform.y + platform.height);
            ctx.lineTo(platform.x + platform.width / 2, platform.y);
            ctx.lineTo(platform.x + platform.width, platform.y + platform.height);
            ctx.fill();
        } else {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
    });
}

function drawCoins() {
    ctx.fillStyle = '#FFD700';
    coins.forEach(coin => {
        ctx.beginPath();
        ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateDoodler() {
    if (doodler.hasJetpack && doodler.jetpackFuel > 0) {
        doodler.vy = -10;
        doodler.jetpackFuel -= 0.5;
    } else {
        doodler.vy += gravity;
    }

    doodler.y += doodler.vy;
    doodler.distance += Math.abs(doodler.vy);

    if (doodler.distance > doodler.highscore) {
        doodler.highscore = doodler.distance;
    }

    if (doodler.y + doodler.height > canvas.height) {
        alert(`Game Over! Счёт: ${doodler.score}, Пройдено метров: ${Math.floor(doodler.distance)}`);
        resetGame();
    }

    platforms.forEach(platform => {
        if (
            doodler.vy > 0 &&
            doodler.y + doodler.height <= platform.y + platform.height &&
            doodler.y + doodler.height + doodler.vy >= platform.y &&
            doodler.x + doodler.width >= platform.x &&
            doodler.x <= platform.x + platform.width
        ) {
            if (platform.type === 'spike') {
                alert(`Game Over! Вы упали на шипы. Счёт: ${doodler.score}, Пройдено метров: ${Math.floor(doodler.distance)}`);
                resetGame();
            } else {
                doodler.vy = jumpStrength;
                doodler.score += 10;
            }
        }
    });

    coins.forEach((coin, index) => {
        if (
            doodler.x + doodler.width >= coin.x &&
            doodler.x <= coin.x + coin.width &&
            doodler.y + doodler.height >= coin.y &&
            doodler.y <= coin.y + coin.height
        ) {
            coins.splice(index, 1);
            doodler.score += 50;
            if (Math.random() < 0.1) {
                doodler.hasJetpack = true;
                doodler.jetpackFuel = 100;
            }
        }
    });
}

function updatePlatforms() {
    platforms.forEach((platform, index) => {
        platform.y += 1;
        if (platform.y > canvas.height) {
            platform.x = Math.random() * (canvas.width - platform.width);
            platform.y = 0;
            platform.type = Math.random() < 0.2 ? 'spike' : 'normal';

            if (Math.random() < 0.3 && platform.type !== 'spike') {
                createCoin(platform);
            }
        }
    });

    coins.forEach((coin, index) => {
        coin.y += 1;
        if (coin.y > canvas.height) {
            coins.splice(index, 1);
        }
    });
}

function moveDoodler(e) {
    if (e.key === 'ArrowLeft' && doodler.x > 0) {
        doodler.x -= 20;
    } else if (e.key === 'ArrowRight' && doodler.x + doodler.width < canvas.width) {
        doodler.x += 20;
    }
}

function resetGame() {
    doodler.x = canvas.width / 2 - 20;
    doodler.y = canvas.height - 100;
    doodler.vy = 0;
    doodler.score = 0;
    doodler.distance = 0;
    doodler.hasJetpack = false;
    doodler.jetpackFuel = 0;
    platforms = [];
    coins = [];
    createPlatforms();
    document.getElementById('score').innerText = doodler.score;
    document.getElementById('distance').innerText = Math.floor(doodler.distance);
    document.getElementById('highscore').innerText = Math.floor(doodler.highscore);
}

function updateScoreboard() {
    document.getElementById('score').innerText = doodler.score;
    document.getElementById('distance').innerText = Math.floor(doodler.distance);
    document.getElementById('highscore').innerText = Math.floor(doodler.highscore);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateDoodler();
    updatePlatforms();
    drawDoodler();
    drawPlatforms();
    drawCoins();
    updateScoreboard();
    requestAnimationFrame(gameLoop);
}

createPlatforms();
document.addEventListener('keydown', moveDoodler);
gameLoop();
