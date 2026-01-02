import k from "./game";
import { INITIAL_BOMB_COUNT, TILE } from "./constants";
import Level from "./level";
import LevelRenderer from "./levelRenderer";
import Player from "./player";
import HUD from "./hud";
import GameLogic from "./gameLogic";
import InputController from "./input";
import { registry } from "./entities";

async function startGame(): Promise<void> {
    const _ = registry; // Ensure registry is initialized
    const level = await Level.fromImage("assets/levels/level1.png");
    console.log(`Loaded level with dimensions: ${level.getWidth()}x${level.getHeight()}`)

    const renderer = new LevelRenderer(level, TILE);
    console.log("Rendered loaded with level.")

    const [startX, startY] = level.playerPosition();
    console.log(`Player start position: (${startX}, ${startY})`);

    const player = new Player(startX, startY);
    const hud = new HUD(level.totalGems(), INITIAL_BOMB_COUNT);
    const game = new GameLogic(renderer, player, hud);
    console.log("Initialized game logic.");
    renderer.redrawAll();
    console.log("Starting game loop.");


    new InputController({
        move: (dx, dy) => game.movePlayer(dx, dy),
        bomb: () => game.useBomb(),
        restart: () => game.restart(),
    });

    k.onUpdate(() => {
        game.update(k.dt());
    });
}

k.onLoad(() => {
    void startGame();
});
