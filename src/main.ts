import "./style.css";
import car from "/car.png";
import enemy_car_1 from "/enemy-car-1.png";
import {
  default as enemy_car_2,
  default as enemy_car_3,
} from "/enemy-car-2.png";
import enemy_car_4 from "/enemy-car-4.png";
import road from "/road-texture4.png";

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GAME_CONSTANTS,
} from "./constants/constants";
import { Coords } from "./types/types";
import {
  drawCar,
  drawEnemy,
  drawHighScore,
  drawRoad,
  drawScore,
  getRandomCoords,
} from "./utilities/canvas_utils";
import { clamp, getRandomRange } from "./utilities/utils";

const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
const score = document.querySelector<HTMLSpanElement>("#score")!;
const restart = document.querySelector<HTMLButtonElement>("#restart")!;
const start_button = document.querySelector<HTMLButtonElement>("#start")!;
const highScoreElement =
  document.querySelector<HTMLSpanElement>("#high-score")!;
//@ts-ignore
let highScore: number = parseInt(localStorage.getItem("highScore")) || 0;
const ctx = canvas.getContext("2d")!;
const car_image = new Image();
car_image.src = car;

// enemy cars
const enemy_cars_images = [
  enemy_car_1,
  enemy_car_2,
  enemy_car_3,
  enemy_car_4,
].map((src) => {
  const img = new Image();
  img.src = src;
  return img;
});

let road_img = new Image();
road_img.src = road;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.style.background = road;

let carX = canvas.width / 2 - GAME_CONSTANTS.SCALED_WIDTH / 2;
let carY = canvas.height - GAME_CONSTANTS.SCALED_HEIGHT;
let gameSpeed = 1;
let _score = 0;
let animationId: number;
let isGameOver: boolean = false;
const activeKeys = new Set();
score.innerText = String(_score);
highScoreElement.innerText = String(highScore);

const enemy_cars: Coords[] = [];
function generateEnemyCars() {
  for (let i = 0; i < 5; i++) {
    enemy_cars.push({
      x: getRandomRange(0, canvas.width),
      y: getRandomRange(-500, 0),
    });
  }
}
generateEnemyCars();

function moveEnemy(delta: number) {
  for (let i = 0; i < enemy_cars.length; i++) {
    enemy_cars[i].y += clamp((1 * delta * gameSpeed) / 10, 0, 3);
    if (enemy_cars[i].y >= canvas.height) {
      _score++;
      enemy_cars[i].y =
        getRandomCoords(ctx, enemy_cars)?.y || getRandomRange(-500, 0);
      enemy_cars[i].x =
        getRandomCoords(ctx, enemy_cars)?.x ||
        getRandomRange(0, canvas.width - GAME_CONSTANTS.SCALED_WIDTH);
    }
    drawCar(ctx, enemy_cars_images[3], enemy_cars[i].x, enemy_cars[i].y);
  }
}

function detectCollsion() {
  const { SCALED_HEIGHT, SCALED_WIDTH } = GAME_CONSTANTS;
  for (let i = 0; i < enemy_cars.length; i++) {
    if (
      carX < enemy_cars[i].x + SCALED_WIDTH &&
      carX + SCALED_WIDTH > enemy_cars[i].x &&
      carY < enemy_cars[i].y + SCALED_HEIGHT &&
      carY + SCALED_HEIGHT > enemy_cars[i].y
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
      drawCar(ctx, car_image, carX, carY);
    }
  }
}

//show game over screen
function gameOver() {
  const gameOverScreen = document.querySelector<HTMLDivElement>(".game-over")!;
  score.innerText = String(_score);
  gameOverScreen.style.display = "block";
}

let last_time = Date.now();
function gameLoop() {
  if (isGameOver) return;
  let current_time = Date.now();
  let delta = current_time - last_time;
  last_time = current_time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad(ctx, road_img);
  updateCarPosition();
  drawEnemy(ctx, enemy_cars, enemy_cars_images);
  moveEnemy(delta);
  drawScore(ctx, _score);
  drawHighScore(ctx, highScore);
  detectCollsion();
  if (_score % 10 === 0) gameSpeed *= 1.5;
  score.innerText = String(_score);
  animationId = requestAnimationFrame(gameLoop);
}

function updateCarPosition() {
  if (isGameOver) return;
  if (
    activeKeys.has("ArrowLeft") ||
    activeKeys.has("a") ||
    activeKeys.has("A")
  ) {
    carX -= 5;
    if (carX < 0) carX = 0;
  }
  if (
    activeKeys.has("ArrowRight") ||
    activeKeys.has("d") ||
    activeKeys.has("D")
  ) {
    carX += 5;
    if (carX > canvas.width - GAME_CONSTANTS.SCALED_WIDTH)
      carX = canvas.width - GAME_CONSTANTS.SCALED_WIDTH;
  }
  drawRoad(ctx, road_img);
  drawCar(ctx, car_image, carX, carY);
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
start_button.addEventListener("click", () => {
  start_button.style.display = "none";
  gameLoop();
});

drawRoad(ctx, road_img);
drawCar(ctx, car_image, carX, carY);
