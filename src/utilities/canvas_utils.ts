import { GAME_CONSTANTS } from "../constants/constants";
import { Coords, EnemyCar } from "../types/types";
import { getRandomRange } from "./utils";

export function drawScore(ctx: CanvasRenderingContext2D, _score: number) {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + _score, 8, 20);
}

export function drawHighScore(
  ctx: CanvasRenderingContext2D,
  highScore: number
) {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("High Score: " + highScore, 8, 40);
}

export function drawRoad(
  ctx: CanvasRenderingContext2D,
  road_img: HTMLImageElement
) {
  ctx.drawImage(
    road_img,
    0,
    0,
    1024,
    1024,
    0,
    0,
    ctx.canvas.width,
    ctx.canvas.height
  );
}

export function drawCar(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number
) {
  ctx.drawImage(
    img,
    0,
    0,
    GAME_CONSTANTS.IMAGE_WIDTH,
    GAME_CONSTANTS.IMAGE_HEIGHT,
    x,
    y,
    GAME_CONSTANTS.SCALED_WIDTH,
    GAME_CONSTANTS.SCALED_HEIGHT
  );
}

export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy_cars: EnemyCar[]
) {
  for (let i = 0; i < enemy_cars.length; i++) {
    drawCar(ctx, enemy_cars[i].image, enemy_cars[i].x, enemy_cars[i].y);
  }
}

export function getRandomCoords(
  ctx: CanvasRenderingContext2D,
  enemy_cars: EnemyCar[],
  multiplier: number = 1
): Coords | undefined {
  let x: number;
  let y: number;
  let overlaps = false;
  multiplier = multiplier || 1;
  do {
    x = getRandomRange(
      multiplier * 5,
      ctx.canvas.width - GAME_CONSTANTS.IMAGE_WIDTH - 100
    );
    y = getRandomRange(multiplier * -20 - ctx.canvas.height, 0);
    for (let i = 0; i < enemy_cars.length; i++) {
      if (checkCollision({ x, y }, enemy_cars[i])) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) {
      return { x, y };
    }
  } while (true && !overlaps);
}

export function moveBg(ctx: CanvasRenderingContext2D, bgY: number, Y: number) {
  Y += 1;
  if (bgY >= ctx.canvas.height) {
    bgY = 0;
  }
}

export function checkCollision(car: Coords, enemyCar: EnemyCar) {
  const carLeft = car.x;
  const carRight = car.x + GAME_CONSTANTS.SCALED_WIDTH;
  const carTop = car.y;
  const carBottom = car.y + GAME_CONSTANTS.SCALED_HEIGHT;

  const enemyCarLeft = enemyCar.x;
  const enemyCarRight = enemyCar.x + GAME_CONSTANTS.SCALED_WIDTH;
  const enemyCarTop = enemyCar.y;
  const enemyCarBottom = enemyCar.y + GAME_CONSTANTS.SCALED_HEIGHT;

  return (
    carLeft <= enemyCarRight &&
    carRight >= enemyCarLeft &&
    carTop <= enemyCarBottom &&
    carBottom >= enemyCarTop
  );
}
