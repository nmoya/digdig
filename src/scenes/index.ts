import { registerGameScene } from "./gameScene"
import { registerGameOverScene } from "./gameOver"
import { registerMainMenuScene } from "./mainMenu"
import { registerWinScene } from "./win"

export function registerScenes(): void {
    registerMainMenuScene()
    registerGameScene()
    registerWinScene()
    registerGameOverScene()
}
