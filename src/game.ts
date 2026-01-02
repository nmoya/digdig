import kaplay from "kaplay"
import { type ButtonsDef } from "kaplay"

const keyBindings: ButtonsDef = {
    moveUp: {
        keyboard: ["w", "up"],
        gamepad: ["north", "dpad-up"],
    },
    moveDown: {
        keyboard: ["s", "down"],
        gamepad: ["south", "dpad-down"],
    },
    moveLeft: {
        keyboard: ["a", "left"],
        gamepad: ["west", "dpad-left"],
    },
    moveRight: {
        keyboard: ["d", "right"],
        gamepad: ["east", "dpad-right"],
    },
    bomb: {
        keyboard: ["space"],
        gamepad: ["rshoulder"],
    },
    restart: {
        keyboard: ["r"],
        gamepad: ["start"],
    },
    winLevel: {
        keyboard: ["k"],
        gamepad: [],
    },

    // Debug: jump directly to a level via number keys.
    jumpLevel1: { keyboard: ["1"], gamepad: [] },
    jumpLevel2: { keyboard: ["2"], gamepad: [] },
    jumpLevel3: { keyboard: ["3"], gamepad: [] },
    jumpLevel4: { keyboard: ["4"], gamepad: [] },
    jumpLevel5: { keyboard: ["5"], gamepad: [] },
    jumpLevel6: { keyboard: ["6"], gamepad: [] },
    jumpLevel7: { keyboard: ["7"], gamepad: [] },
    jumpLevel8: { keyboard: ["8"], gamepad: [] },
    jumpLevel9: { keyboard: ["9"], gamepad: [] },
}

const k: any = kaplay({
    width: 320,
    height: 192,
    letterbox: true,
    crisp: true,
    pixelDensity: 4,
    stretch: true,
    background: [15, 15, 18],
    global: false,
    debug: true,
    debugKey: "]",
    buttons: keyBindings
})

k.loadRoot("./")
k.loadSprite("closed_door", `sprites/closed_door.png`)
k.loadSprite("dirt", `sprites/dirt_single.png`)
k.loadSprite("empty", `sprites/empty.png`)
k.loadSprite("gem", `sprites/gem.png`)
k.loadSprite("open_door", `sprites/open_door.png`)
k.loadSprite("player", `sprites/player.png`)
k.loadSprite("rock", `sprites/rock.png`)
k.loadSprite("wall", `sprites/wall.png`)


export { k, keyBindings }
