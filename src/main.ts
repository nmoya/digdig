import k from "./game"
import { HUD_BAR_HEIGHT, INITIAL_BOMB_COUNT, TILE, LevelConfig, LEVELS } from "./constants"
import Level from "./level"
import LevelRenderer from "./levelRenderer"
import Player from "./player"
import HUD from "./hud"
import GameLogic from "./gameLogic"
import InputController from "./input"
import { registry } from "./entities"
import CameraFollow from "./camera"


k.scene("game", async (levelToLoad: LevelConfig) => {
    const _ = registry

    const level = await Level.fromImage(levelToLoad.url)
    console.log(`Loaded level "${levelToLoad.id}" with dimensions: ${level.getWidth()}x${level.getHeight()}`)

    const renderer = new LevelRenderer(level, TILE, HUD_BAR_HEIGHT + TILE / 2)
    console.log("Renderer ready with loaded level.")

    const [startX, startY] = level.playerPosition()
    console.log(`Player start position: (${startX}, ${startY})`)

    const player = new Player(startX, startY)
    const hud = new HUD(level.totalGems(), INITIAL_BOMB_COUNT, levelToLoad.name)
    const game = new GameLogic(renderer, player, hud)
    const camera = new CameraFollow(renderer, player)
    console.log("Initialized game logic.")
    renderer.redrawAll()
    console.log("Starting game loop.")

    new InputController({
        move: (dx, dy) => game.movePlayer(dx, dy),
        bomb: () => game.useBomb(),
        restart: () => game.restart(),
        winLevel: () => {
            game.winLevel()
        }
    })

    k.onUpdate(() => {
        const dt = k.dt()
        game.update(dt)
        if (game.didWin() && levelToLoad.next) {
            k.go("game", LEVELS.find(l => l.id === levelToLoad.next)!)
            return
        }
        if (game.isGameOver()) {
            k.go("game", LEVELS[0])
            return
        }
        camera.update(dt)
    })
})

k.onLoad(() => {
    k.go("game", LEVELS[0])
})
