import LevelRenderer from "./levelRenderer"
import { registry } from "./entities"

class GravityManager {
    private activeFallers = new Set<string>()
    private armedWaitingForPlayerToLeave = new Set<string>()
    private hasFallenAtLeastOnce = new Set<string>()

    constructor(private renderer: LevelRenderer) { }

    private key(x: number, y: number): string {
        return `${x},${y}`
    }

    private parseKey(key: string): { x: number, y: number } {
        const [xs, ys] = key.split(",")
        return { x: Number(xs), y: Number(ys) }
    }

    private forgetStateAt(x: number, y: number): void {
        const k = this.key(x, y)
        this.activeFallers.delete(k)
        this.armedWaitingForPlayerToLeave.delete(k)
        this.hasFallenAtLeastOnce.delete(k)
    }

    private activateFallerAt(x: number, y: number): void {
        if (!this.renderer.inBounds(x, y)) return
        if (!this.renderer.cell(x, y).canFall()) return
        this.activeFallers.add(this.key(x, y))
    }

    private onCellEmptied(x: number, y: number): void {
        const aboveY = y - 1
        if (!this.renderer.inBounds(x, aboveY)) return

        if (!this.renderer.cell(x, aboveY).canFall()) return

        const aboveKey = this.key(x, aboveY)
        this.armedWaitingForPlayerToLeave.delete(aboveKey)
        this.activeFallers.add(aboveKey)
    }

    private onPlayerEnteredCell(x: number, y: number): void {
        // If the player moves under a resting rock/gem, ensure we consider it on the next tick
        // so we can "arm" it (instead of letting it fall the instant the player leaves)
        this.activateFallerAt(x, y - 1)
    }

    initialize(): void {
        this.activeFallers.clear()
        this.armedWaitingForPlayerToLeave.clear()
        this.hasFallenAtLeastOnce.clear()

        let y = 0
        while (y < this.renderer.getHeight()) {
            let x = 0
            while (x < this.renderer.getWidth()) {
                if (this.renderer.cell(x, y).canFall()) {
                    this.activeFallers.add(this.key(x, y))
                }
                x++
            }
            y++
        }
    }

    onPlayerMoved(oldX: number, oldY: number, newX: number, newY: number): void {
        this.onCellEmptied(oldX, oldY)
        this.onPlayerEnteredCell(newX, newY)
    }

    onRockPushed(fromX: number, fromY: number, toX: number, toY: number): void {
        this.forgetStateAt(fromX, fromY)
        this.onCellEmptied(fromX, fromY)
        this.activateFallerAt(toX, toY)
    }

    onCellCleared(x: number, y: number): void {
        this.forgetStateAt(x, y)
        this.onCellEmptied(x, y)
    }

    tick(): boolean {
        const toProcess = Array.from(this.activeFallers)
            .map((k) => ({ k, ...this.parseKey(k) }))
            .sort((a, b) => b.y - a.y || a.x - b.x)

        for (const item of toProcess) {
            if (!this.activeFallers.has(item.k)) continue

            const { x, y } = item

            if (!this.renderer.inBounds(x, y)) {
                this.forgetStateAt(x, y)
                continue
            }

            const t = this.renderer.cell(x, y)
            if (!t.canFall()) {
                this.forgetStateAt(x, y)
                continue
            }

            const belowY = y + 1
            if (!this.renderer.inBounds(x, belowY)) {
                this.forgetStateAt(x, y)
                continue
            }

            const below = this.renderer.cell(x, belowY)

            if (below.isPlayer()) {
                if (this.hasFallenAtLeastOnce.has(item.k)) {
                    this.renderer.setCell(x, y, registry.empty())
                    this.renderer.setCell(x, belowY, t)
                    this.renderer.drawCell(x, y)
                    this.renderer.drawCell(x, belowY)

                    this.forgetStateAt(x, y)
                    return true
                }

                this.activeFallers.delete(item.k)
                this.armedWaitingForPlayerToLeave.add(item.k)
                continue
            }

            if (below.isEmpty()) {
                const toKey = this.key(x, belowY)

                this.renderer.setCell(x, y, registry.empty())
                this.renderer.setCell(x, belowY, t)
                this.renderer.drawCell(x, y)
                this.renderer.drawCell(x, belowY)

                this.activeFallers.delete(item.k)
                this.activeFallers.add(toKey)
                this.armedWaitingForPlayerToLeave.delete(item.k)

                this.hasFallenAtLeastOnce.delete(item.k)
                this.hasFallenAtLeastOnce.add(toKey)

                this.onCellEmptied(x, y)
                continue
            }

            this.forgetStateAt(x, y)
        }

        return false
    }
}

export default GravityManager
