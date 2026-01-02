import { k } from "./game"
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
    const renderer = new LevelRenderer(level, TILE, HUD_BAR_HEIGHT + TILE / 2)
    const [startX, startY] = level.playerPosition()
    const player = new Player(startX, startY)
    const hud = new HUD(level.totalGems(), INITIAL_BOMB_COUNT, levelToLoad.name)
    const game = new GameLogic(renderer, player, hud)
    const camera = new CameraFollow(renderer, player)
    renderer.redrawAll()

    const input = new InputController()
    const cleanBindings = game.bindInput(input)
    k.onSceneLeave(() => cleanBindings())

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
