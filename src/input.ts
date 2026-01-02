import k from "./game"
import { PLAYER_MOVE_SPEED } from "./constants"
import { debug } from "node:console"

export type InputActions = {
    move: (dx: number, dy: number) => void
    bomb: () => void
    restart: () => void
    winLevel: () => void
}


class InputController {
    private unsubscribers: Array<() => void> = []
    private repeatIntervalSecs: number

    private dirPressedOrder: string[] = []
    private repeatAccSecs = 0

    constructor(
        private actions: InputActions,
    ) {
        this.repeatIntervalSecs = 1 / PLAYER_MOVE_SPEED
        this.bind()
    }

    private bind(): void {
        const onKeyPress = (key: string, fn: () => void) => {
            const unsub = k.onKeyPress(key, fn)
            if (typeof unsub === "function") {
                this.unsubscribers.push(unsub)
            }
        }

        const dirForKey = (key: string): { dx: number, dy: number } | null => {
            switch (key) {
                case "left":
                case "a":
                    return { dx: -1, dy: 0 }
                case "right":
                case "d":
                    return { dx: 1, dy: 0 }
                case "up":
                case "w":
                    return { dx: 0, dy: -1 }
                case "down":
                case "s":
                    return { dx: 0, dy: 1 }
                default:
                    return null
            }
        }

        const pressDirKey = (key: string) => {
            const dir = dirForKey(key)
            if (!dir) return

            const wasAlreadyDown = this.dirPressedOrder.includes(key)

            this.dirPressedOrder = this.dirPressedOrder.filter((k) => k !== key)
            this.dirPressedOrder.push(key)

            this.repeatAccSecs = 0

            if (!wasAlreadyDown) {
                this.actions.move(dir.dx, dir.dy)
            }
        }

        const releaseDirKey = (key: string) => {
            const dir = dirForKey(key)
            if (!dir) return
            this.dirPressedOrder = this.dirPressedOrder.filter((k) => k !== key)
            this.repeatAccSecs = 0
        }

        const onKeyDown = (key: string, fn: () => void) => {
            const unsub = k.onKeyDown(key, fn)
            if (typeof unsub === "function") {
                this.unsubscribers.push(unsub)
            }
        }

        const onKeyRelease = (key: string, fn: () => void) => {
            const unsub = k.onKeyRelease(key, fn)
            if (typeof unsub === "function") {
                this.unsubscribers.push(unsub)
            }
        }

        for (const key of ["left", "right", "up", "down", "a", "d", "w", "s"]) {
            onKeyDown(key, () => pressDirKey(key))
            onKeyRelease(key, () => releaseDirKey(key))
        }

        const unsubUpdate = k.onUpdate(() => {
            if (this.dirPressedOrder.length === 0) return

            const activeKey = this.dirPressedOrder[this.dirPressedOrder.length - 1]
            const dir = dirForKey(activeKey)
            if (!dir) return

            const dt = k.dt()
            this.repeatAccSecs += dt
            while (this.repeatAccSecs >= this.repeatIntervalSecs) {
                this.repeatAccSecs -= this.repeatIntervalSecs
                this.actions.move(dir.dx, dir.dy)
            }
        })
        if (typeof unsubUpdate === "function") {
            this.unsubscribers.push(unsubUpdate)
        }

        onKeyPress("space", () => this.actions.bomb())
        onKeyPress("r", () => this.actions.restart())
        onKeyPress("k", () => this.actions.winLevel())
    }

    dispose(): void {
        for (const unsub of this.unsubscribers) {
            try {
                unsub()
            } catch {
            }
        }
        this.unsubscribers = []
    }
}

export default InputController
