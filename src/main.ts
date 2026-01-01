import k from "./game";
import { LEVEL, INITIAL_BOMB_COUNT } from "./constants";
import LevelRenderer from "./levelRenderer";
import Player from "./player";
import HUD from "./hud";
import GameLogic from "./gameLogic";
import InputController from "./input";

const renderer = new LevelRenderer(LEVEL, BigInt(32));
const [startX, startY] = renderer.getInitialPlayerPosition();
const player = new Player(startX, startY);
const hud = new HUD(renderer.getTotalGems(), INITIAL_BOMB_COUNT);
const game = new GameLogic(renderer, player, hud);

renderer.redrawAll();

new InputController({
  move: (dx, dy) => game.movePlayer(dx, dy),
  bomb: () => game.useBomb(),
  restart: () => game.restart(),
});

k.onUpdate(() => {
  game.update(k.dt());
});
