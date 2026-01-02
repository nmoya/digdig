import { k } from "../game"
import { LEVELS } from "../constants"
import { addButton } from "./ui"

export function registerMainMenuScene(): void {
    k.scene("menu", () => {
        k.add([
            k.text("DigDig", { size: 28 }),
            k.pos(20, 30),
            k.fixed(),
            k.color(230, 230, 235),
        ])

        const w = 160
        const h = 44
        const x = Math.floor((k.width() - w) / 2)
        const y = 110

        addButton("Start", x, y, w, h, () => {
            k.go("game", LEVELS[0])
        })
    })
}
