import { k } from "../game"

export function addButton(label: string, x: number, y: number, w: number, h: number, onPress: () => void): void {
    const btn: any = k.add([
        k.rect(w, h),
        k.pos(x, y),
        k.fixed(),
        k.color(0, 0, 0),
        k.area(),
        "ui-button",
    ])

    k.add([
        k.text(label, { size: 16 }),
        k.pos(x + 18, y + 12),
        k.fixed(),
        k.color(230, 230, 235),
        "ui-button-label",
    ])

    if (typeof btn.onClick === "function") {
        btn.onClick(onPress)
    } else if (typeof k.onClick === "function") {
        k.onClick("ui-button", onPress)
    }
}
