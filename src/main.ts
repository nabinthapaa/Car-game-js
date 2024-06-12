import "./style.css";
import car from "/car.png";

const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
const score = document.querySelector<HTMLSpanElement>("#score")!;
const restart = document.querySelector<HTMLButtonElement>("#restart")!;
const highScoreElement =
  document.querySelector<HTMLSpanElement>("#high-score")!;
let highScore: number = parseInt(localStorage.getItem("highScore")) || 0;
const ctx = canvas.getContext("2d")!;
const car_image = new Image();
car_image.src = car;

canvas.width = 600;
canvas.height = 900;

const scale = 0.15;
const image_width = 270;
const image_height = 470;
let carX = canvas.width / 2 - (scale * image_width) / 2;
let carY = canvas.height - scale * image_height;
let gameSpeed = 1;
let _score = 0;
let animationId: number;
let isGameOver: boolean = false;
const activeKeys = new Set();
score.innerText = String(_score);
highScoreElement.innerText = String(highScore);

function drawCar(x: number, y: number) {
  ctx.drawImage(
    car_image,
    0,
    0,
    image_width,
    image_height,
    x,
    y,
    scale * 270,
    scale * 470
  );
}

function drawRoad() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function lanes() {
  ctx.fillStyle = "#fff";
  for (let i = 0; i * 40 < canvas.height; i++) {
    ctx.fillRect(canvas.width * 0.3 - 5, i * 40, 10, 20);
  }

  for (let i = 0; i * 40 < canvas.height; i++) {
    ctx.fillRect(canvas.width * 0.7 - 5, i * 40, 10, 20);
  }
}

const enemy_cars: any[] = [];
function generateEnemyCars() {
  for (let i = 0; i < 5; i++) {
    enemy_cars.push({
      x: getRandomRange(0, canvas.width),
      y: getRandomRange(-500, 0),
    });
  }
}

generateEnemyCars();

function getRandomCoords(enemy_cars: any[]) {
  let x: number;
  let y: number;
  let validPosition: boolean;
  let maxAttempts = 100; // To avoid infinite loops in case of too many cars
  let attempts = 0;

  do {
    x = getRandomRange(0, canvas.width - scale * image_width);
    y = getRandomRange(-1 * canvas.height, 0);

    validPosition = enemy_cars.every((car) => {
      const carRight = car.x + scale * image_width;
      const carBottom = car.y + scale * image_height;
      const newCarRight = x + scale * image_width;
      const newCarBottom = y + scale * image_height;

      // Check if there is an overlap
      return (
        newCarRight <= car.x || // new car is to the left of existing car
        x >= carRight || // new car is to the right of existing car
        newCarBottom <= car.y || // new car is above existing car
        y >= carBottom // new car is below existing car
      );
    });

    attempts++;
  } while (!validPosition && attempts < maxAttempts);

  if (!validPosition) {
    return;
  }

  return { x, y };
}

function getRandomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

function drawEnemy() {
  for (let i = 0; i < enemy_cars.length; i++) {
    drawCar(enemy_cars[i].x, enemy_cars[i].y);
  }
}
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function moveEnemy() {
  for (let i = 0; i < enemy_cars.length; i++) {
    enemy_cars[i].y += clamp(1 * gameSpeed, 0, 5);
    if (enemy_cars[i].y >= canvas.height) {
      _score++;
      enemy_cars[i].y =
        getRandomCoords(enemy_cars)?.y || getRandomRange(-500, 0);
      enemy_cars[i].x =
        getRandomCoords(enemy_cars)?.x || getRandomRange(0, canvas.width);
    }
    drawCar(enemy_cars[i].x, enemy_cars[i].y);
  }
}

function detectCollsion() {
  for (let i = 0; i < enemy_cars.length; i++) {
    if (
      carX < enemy_cars[i].x + scale * image_width &&
      carX + scale * image_width > enemy_cars[i].x &&
      carY < enemy_cars[i].y + scale * image_height &&
      carY + scale * image_height > enemy_cars[i].y
    ) {
      animationId && cancelAnimationFrame(animationId);
      gameSpeed = 0;
      isGameOver = true;
      if (_score > highScore) {
        highScore = _score;
        highScoreElement.innerText = String(highScore);
        localStorage.setItem("highScore", String(highScore));
      }
      gameOver();
    }
  }
}

//show game over screen
function gameOver() {
  const gameOverScreen = document.querySelector<HTMLDivElement>(".game-over")!;
  const finalScore = document.querySelector<HTMLSpanElement>("#final-score")!;
  finalScore.innerText = String(_score);
  gameOverScreen.style.display = "flex";
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  lanes();
  updateCarPosition();
  drawEnemy();
  moveEnemy();
  detectCollsion();
  gameSpeed *= 1.01;
  score.innerText = String(_score);
  animationId = requestAnimationFrame(gameLoop);
}

gameLoop();

function updateCarPosition() {
  if (isGameOver) return;
  if (
    activeKeys.has("ArrowLeft") ||
    activeKeys.has("a") ||
    activeKeys.has("A")
  ) {
    carX -= 10;
    if (carX < 0) carX = 0;
  }
  if (
    activeKeys.has("ArrowRight") ||
    activeKeys.has("d") ||
    activeKeys.has("D")
  ) {
    carX += 10;
    if (carX > canvas.width - scale * image_width)
      carX = canvas.width - scale * image_width;
  }
  drawRoad();
  lanes();
  drawCar(carX, carY);
}

function restartGame() {
  const gameOverScreen = document.querySelector<HTMLDivElement>(".game-over")!;
  gameOverScreen.style.display = "none";
  gameSpeed = 1;
  _score = 0;
  isGameOver = false;
  enemy_cars.length = 0;
  generateEnemyCars();
  gameLoop();
}

document.addEventListener("keydown", (e) => {
  activeKeys.add(e.key);
});

document.addEventListener("keyup", (e) => {
  activeKeys.delete(e.key);
});

restart.onclick = restartGame;
