import { HUD_BAR_HEIGHT, INITIAL_BOMB_COUNT, TILE, LevelConfig, LEVELS } from "../constants"
import { k } from "../game"
import { registry } from "../entities"
import CameraFollow from "../camera"
import GameLogic from "../gameLogic"
import HUD from "../hud"
import InputController from "../input"
import Level from "../level"
import LevelRenderer from "../levelRenderer"
import Player from "../player"

function getNextLevelConfig(levelToLoad: LevelConfig): LevelConfig | null {
    if (!levelToLoad.next) return null
    return LEVELS.find(l => l.id === levelToLoad.next) ?? null
}

export function registerGameScene(): void {
    k.scene("game", async (levelToLoad: LevelConfig) => {
        // Ensure registry is initialized (it has side effects in some setups).
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

        k.onSceneLeave(() => {
            cleanBindings()
            input.destroy()
        })

        k.onUpdate(() => {
            const dt = k.dt()
            game.update(dt)

            if (game.didWin()) {
                const next = getNextLevelConfig(levelToLoad)
                if (next) {
                    k.go("game", next)
                } else {
                    k.go("win")
                }
                return
            }

            if (game.isGameOver()) {
                k.go("gameover")
                return
            }

            camera.update(dt)
        })
    })
}
