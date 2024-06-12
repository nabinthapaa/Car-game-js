import { GAME_CONSTANTS } from "../constants/constants";
import { Coords } from "../types/types";
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
  enemy_cars: Coords[],
  enemy_cars_images: HTMLImageElement[]
) {
  for (let i = 0; i < enemy_cars.length; i++) {
    drawCar(ctx, enemy_cars_images[3], enemy_cars[i].x, enemy_cars[i].y);
  }
}

export function getRandomCoords(
  ctx: CanvasRenderingContext2D,
  enemy_cars: Coords[]
): { x: number; y: number } {
  let x: number;
  let y: number;
  let attempts = 0;

  do {
    x = getRandomRange(0, ctx.canvas.width - GAME_CONSTANTS.SCALED_WIDTH);
    y = getRandomRange(-1 * ctx.canvas.height, 0);
    let overlaps = false;
    for (let i = 0; i < enemy_cars.length; i++) {
      const aLeft = x;
      const aRight = x + GAME_CONSTANTS.SCALED_WIDTH;
      const aTop = y;
      const aBottom = y + GAME_CONSTANTS.SCALED_HEIGHT;

      const bLeft = enemy_cars[i].x;
      const bRight = enemy_cars[i].x + GAME_CONSTANTS.SCALED_WIDTH;
      const bTop = enemy_cars[i].y;
      const bBottom = enemy_cars[i].y + GAME_CONSTANTS.SCALED_HEIGHT;
      overlaps =
        aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
      if (overlaps) break;
    }
    if (!overlaps) {
      return { x, y };
    }

    attempts++;
  } while (true);
}
