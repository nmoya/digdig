import { k } from "../game"
import { addButton } from "./ui"

export function registerGameOverScene(): void {
    k.scene("gameover", () => {
        k.add([
            k.text("Game Over", { size: 28 }),
            k.pos(20, 60),
            k.fixed(),
            k.color(230, 230, 235),
        ])

        const w = 160
        const h = 44
        const x = Math.floor((k.width() - w) / 2)
        const y = 120

        addButton("Main Menu", x, y, w, h, () => {
            k.go("menu")
        })
    })
}
