import { k, keyBindings } from "./game"
import { PLAYER_MOVE_SPEED } from "./constants"

type Handler<T> = T extends void ? () => void : (payload: T) => void

export type MoveAction = "moveUp" | "moveDown" | "moveLeft" | "moveRight"

export type InputEventMap = {
    move: { action: MoveAction }
    bomb: void
    restart: void
    winLevel: void
}

export function Throttle(waitMs: number) {
    const lastInvoke = new WeakMap<object, number>()

    return function (
        _target: object,
        _key: string | symbol,
        descriptor: PropertyDescriptor,
    ) {
        const original = descriptor.value as (...args: any[]) => any

        descriptor.value = function (this: object, ...args: any[]) {
            const now = Date.now()
            const last = lastInvoke.get(this) ?? 0
            let lastResult: any = null

            if (now - last >= waitMs) {
                lastInvoke.set(this, now)
                lastResult = original.apply(this, args)
            }
            return lastResult
        }

        return descriptor
    }
}

class InputController {

    private listeners = new Map<keyof InputEventMap, Set<Function>>()
    private bindings: any[] = []

    constructor() {
        this.bind()
    }

    destroy(): void {
        for (const b of this.bindings) {
            if (!b) continue
            if (typeof b === "function") {
                b()
                continue
            }
            if (typeof b.cancel === "function") {
                b.cancel()
            }
        }
        this.bindings = []
        this.listeners.clear()
    }

    subscribe<K extends keyof InputEventMap>(eventName: K, handler: Handler<InputEventMap[K]>): () => void {
        const existing = this.listeners.get(eventName)
        const set = existing ?? new Set<Function>()
        set.add(handler as unknown as Function)
        if (!existing) {
            this.listeners.set(eventName, set)
        }
        return () => {
            const current = this.listeners.get(eventName)
            if (!current) return
            current.delete(handler as unknown as Function)
            if (current.size === 0) {
                this.listeners.delete(eventName)
            }
        }
    }

    private emit<K extends keyof InputEventMap>(eventName: K, payload: InputEventMap[K]): void {
        const handlers = this.listeners.get(eventName)
        if (!handlers || handlers.size === 0) return
        for (const handler of handlers) {
            ; (handler as any)(payload)
        }
    }

    @Throttle(PLAYER_MOVE_SPEED)
    private onMoveIsHeld(action: MoveAction) {
        this.emit("move", { action })
    }

    private bind(): void {
        for (const action of Object.keys(keyBindings)) {
            if (action.startsWith("move")) {
                this.bindings.push(k.onButtonDown(action, () => this.onMoveIsHeld(action as MoveAction)))
            }
            else {
                this.bindings.push(k.onButtonPress(action, () => this.emit(action as keyof InputEventMap, undefined as any)))
            }
        }
    }
}
export default InputController
