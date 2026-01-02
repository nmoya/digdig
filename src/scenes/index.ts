import { registerGameScene } from "./gameScene"
import { registerGameOverScene } from "./gameOverScene"
import { registerMainMenuScene } from "./mainMenuScene"
import { registerWinScene } from "./winScene"

export function registerScenes(): void {
    registerMainMenuScene()
    registerGameScene()
    registerWinScene()
    registerGameOverScene()
}
