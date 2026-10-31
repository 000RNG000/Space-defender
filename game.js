
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let score = 0;
let lives = 3;
let gameRunning = true;

const keys = {
  left: false,
  right: false,
  fire: false
};

const player = {
  x: WIDTH / 2 - 25,
  y: HEIGHT - 75,
  width: 50,
  height: 45,
  speed: 6
};

let bullets = [];
let enemies = [];
let stars = [];

let lastShot = 0;
let lastEnemy = 0;

// Create background stars
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    speed: Math.random() * 2 + 0.5,
    size: Math.random() * 2 + 1
  });
}

// Draw the player spaceship
function drawPlayer() {
  ctx.fillStyle = "#00e5ff";

  ctx.beginPath();
  ctx.moveTo(player.x + 25, player.y);
  ctx.lineTo(player.x, player.y + 45);
  ctx.lineTo(player.x + 25, player.y + 35);
  ctx.lineTo(player.x + 50, player.y + 45);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(player.x + 21, player.y + 23, 8, 12);
}

// Draw background
function drawStars() {
  ctx.fillStyle = "#ffffff";

  stars.forEach(star => {
    ctx.fillRect(star.x, star.y, star.size, star.size);

    star.y += star.speed;

    if (star.y > HEIGHT) {
      star.y = 0;
      star.x = Math.random() * WIDTH;
    }
  });
}

// Move player
function movePlayer() {
  if (keys.left) {
    player.x -= player.speed;
  }

  if (keys.right) {
    player.x += player.speed;
  }

  player.x = Math.max(
    0,
    Math.min(WIDTH - player.width, player.x)
  );
}

// Shoot bullets
function shoot() {
  const now = Date.now();

  if (keys.fire && now - lastShot > 100) {
    bullets.push({
      x: player.x + 23,
      y: player.y,
      speed: 20
    });

    lastShot = now;
  }
}

// Draw and move bullets
function updateBullets() {
  ctx.fillStyle = "#ffff00";

  bullets.forEach(bullet => {
    bullet.y -= bullet.speed;
    ctx.fillRect(bullet.x, bullet.y, 5, 15);
  });

  bullets = bullets.filter(bullet => bullet.y > -20);
}

// Create enemies
function spawnEnemies() {
  const now = Date.now();

  if (now - lastEnemy > 1000) {
    enemies.push({
      x: Math.random() * (WIDTH - 40),
      y: -40,
      width: 40,
      height: 35,
      speed: 2 + Math.random() * 2
    });

    lastEnemy = now;
  }
}

// Draw and move enemies
function updateEnemies() {
  enemies.forEach(enemy => {
    enemy.y += enemy.speed;

    ctx.fillStyle = "#ff4081";
    ctx.fillRect(
      enemy.x,
      enemy.y,
      enemy.width,
      enemy.height
    );

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(enemy.x + 8, enemy.y + 10, 6, 6);
    ctx.fillRect(enemy.x + 26, enemy.y + 10, 6, 6);
  });

  // Enemies reaching the bottom cost one life
  enemies = enemies.filter(enemy => {
    if (enemy.y > HEIGHT) {
      lives--;
      livesDisplay.textContent = lives;

      if (lives <= 0) {
        endGame();
      }

      return false;
    }

    return true;
  });
}

// Detect collisions
function checkCollisions() {
  bullets.forEach((bullet, bulletIndex) => {
    enemies.forEach((enemy, enemyIndex) => {

      const hit =
        bullet.x < enemy.x + enemy.width &&
        bullet.x + 5 > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + 15 > enemy.y;

      if (hit) {
        bullets.splice(bulletIndex, 1);
        enemies.splice(enemyIndex, 1);

        score += 10;
        scoreDisplay.textContent = score;
      }
    });
  });
}

// End game
function endGame() {
  if (!gameRunning) return;

  gameRunning = false;
  finalScore.textContent = score;
  gameOverScreen.classList.remove("hidden");
}

// Main game loop
function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  drawStars();
  movePlayer();
  shoot();
  updateBullets();
  spawnEnemies();
  updateEnemies();
  checkCollisions();
  drawPlayer();

  requestAnimationFrame(gameLoop);
}

// Keyboard controls
document.addEventListener("keydown", event => {
  if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }

  if (event.key === "ArrowLeft") keys.left = true;
  if (event.key === "ArrowRight") keys.right = true;
  if (event.code === "Space") keys.fire = true;
});

document.addEventListener("keyup", event => {
  if (event.key === "ArrowLeft") keys.left = false;
  if (event.key === "ArrowRight") keys.right = false;
  if (event.code === "Space") keys.fire = false;
});

// Touch and mouse controls
function setupButton(id, key) {
  const button = document.getElementById(id);

  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    keys[key] = true;
  });

  ["pointerup", "pointerleave", "pointercancel"].forEach(type => {
    button.addEventListener(type, () => {
      keys[key] = false;
    });
  });
}

setupButton("leftBtn", "left");
setupButton("rightBtn", "right");
setupButton("fireBtn", "fire");

// Restart game
document.getElementById("restartBtn").addEventListener("click", () => {
  score = 0;
  lives = 3;

  bullets = [];
  enemies = [];

  player.x = WIDTH / 2 - 25;

  lastShot = 0;
  lastEnemy = 0;

  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;

  gameRunning = true;
  gameOverScreen.classList.add("hidden");

  gameLoop();
});

// Start the game
gameLoop();
