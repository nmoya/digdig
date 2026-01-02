import LevelRenderer from "./levelRenderer"
import { Entity, registry } from "./entities"
import { LogInOut } from "./debug"

class GravityManager {
    private activeFallers = new Set<string>()
    private armedWaitingForPlayerToLeave = new Set<string>()
    private hasFallenAtLeastOnce = new Set<string>()

    constructor(private renderer: LevelRenderer, private minSideShaftDepth: number = 2) { }

    private key(x: number, y: number): string {
        return `${x},${y}`
    }

    private parseKey(key: string): { x: number, y: number } {
        const [xs, ys] = key.split(",")
        return { x: Number(xs), y: Number(ys) }
    }

    private isFallingObject(t: Entity): boolean {
        return t.canFall()
    }

    private forgetStateAt(x: number, y: number): void {
        const k = this.key(x, y)
        this.activeFallers.delete(k)
        this.armedWaitingForPlayerToLeave.delete(k)
        this.hasFallenAtLeastOnce.delete(k)
    }

    private activateFallerAt(x: number, y: number): void {
        if (!this.renderer.inBounds(x, y)) return
        if (!this.isFallingObject(this.renderer.cell(x, y))) return
        this.activeFallers.add(this.key(x, y))
    }

    private onCellEmptied(x: number, y: number): void {
        const aboveY = y - 1
        if (!this.renderer.inBounds(x, aboveY)) {
            return
        }
        // Also check left and right neighbors of the emptied cell (shaft)
        const leftX = x - 1
        const rightX = x + 1
        if (this.renderer.inBounds(leftX, y) && this.isFallingObject(this.renderer.cell(leftX, y))) {
            this.activeFallers.add(this.key(leftX, y))
        }
        if (this.renderer.inBounds(rightX, y) && this.isFallingObject(this.renderer.cell(rightX, y))) {
            this.activeFallers.add(this.key(rightX, y))
        }
        if (!this.isFallingObject(this.renderer.cell(x, aboveY))) {
            return
        }
        const aboveKey = this.key(x, aboveY)
        this.armedWaitingForPlayerToLeave.delete(aboveKey)
        this.activeFallers.add(aboveKey)
    }

    private onPlayerEnteredCell(x: number, y: number): void {
        this.activateFallerAt(x, y - 1)
    }

    initialize(): void {
        this.activeFallers.clear()
        this.armedWaitingForPlayerToLeave.clear()
        this.hasFallenAtLeastOnce.clear()

        for (let y = 0; y < this.renderer.getHeight(); y++) {
            for (let x = 0; x < this.renderer.getWidth(); x++) {
                if (this.isFallingObject(this.renderer.cell(x, y))) {
                    this.activeFallers.add(this.key(x, y))
                }
            }
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

    private canFallIntoSideShaft(targetX: number, y: number): boolean {
        // Require an empty column of at least minSideShaftDepth starting at y (current row).
        for (let d = 0; d < this.minSideShaftDepth; d++) {
            const yy = y + d
            if (!this.renderer.inBounds(targetX, yy)) return false
            if (!this.renderer.cell(targetX, yy).isEmpty()) return false
        }
        return true
    }

    // Returns true if gravity killed the player this tick.
    tick(): boolean {
        const toProcess = Array.from(this.activeFallers)
            .map((k) => ({ k, ...this.parseKey(k) }))
            .sort((a, b) => a.y - b.y || a.x - b.x) // top-down so upper rocks can slide before lower ones fall

        for (const item of toProcess) {
            if (!this.activeFallers.has(item.k)) continue

            const { x, y } = item

            if (!this.renderer.inBounds(x, y)) {
                this.forgetStateAt(x, y)
                continue
            }

            const t = this.renderer.cell(x, y)
            if (!this.isFallingObject(t)) {
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
                // Gems do not kill the player
                if (!t.isGem() && this.hasFallenAtLeastOnce.has(item.k)) {
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

            // Try to fall into an adjacent vertical shaft (depth >= 2): move diagonally into it.
            const leftX = x - 1
            const rightX = x + 1
            const canLeft = this.canFallIntoSideShaft(leftX, y)
            const canRight = !canLeft && this.canFallIntoSideShaft(rightX, y)


            if (canLeft || canRight) {
                const targetX = canLeft ? leftX : rightX
                const targetY = y + 1
                const toKey = this.key(targetX, targetY)

                this.renderer.setCell(x, y, registry.empty())
                this.renderer.setCell(targetX, targetY, t)
                this.renderer.drawCell(x, y)
                this.renderer.drawCell(targetX, targetY)

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
