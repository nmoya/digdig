import { k } from "./game"
import { HUD_BAR_HEIGHT, TILE } from "./constants"
import Player from "./player"
import LevelRenderer from "./levelRenderer"

type Vec2 = { x: number, y: number }

class CameraFollow {
    private pos: Vec2

    constructor(
        private renderer: LevelRenderer,
        private player: Player,
        private smoothness: number = 18,
        private pixelSnap: boolean = true,
    ) {
        const start = this.getTargetPos()
        this.pos = { x: start.x, y: start.y }
        this.apply()
    }

    update(dt: number): void {
        const target = this.getTargetPos()

        // Exponential smoothing that's stable across frame rates.
        const t = 1 - Math.exp(-this.smoothness * dt)
        this.pos.x += (target.x - this.pos.x) * t
        this.pos.y += (target.y - this.pos.y) * t

        this.apply()
    }

    private apply(): void {
        const x = this.pixelSnap ? Math.round(this.pos.x) : this.pos.x
        const y = this.pixelSnap ? Math.round(this.pos.y) : this.pos.y
        k.camPos(x, y)
    }

    private getTargetPos(): Vec2 {
        // Center camera on player's tile center.
        const desiredX = this.player.x * TILE + TILE / 2
        const desiredY = this.player.y * TILE + TILE / 2 + HUD_BAR_HEIGHT

        const worldW = this.renderer.getWidth() * TILE
        const worldH = this.renderer.getHeight() * TILE

        const viewW = k.width()
        const viewH = k.height() - HUD_BAR_HEIGHT

        const halfW = viewW / 2
        const halfH = viewH / 2

        const minX = halfW
        const maxX = worldW - halfW
        const minY = HUD_BAR_HEIGHT + halfH
        const maxY = HUD_BAR_HEIGHT + worldH - halfH

        const x = minX > maxX ? worldW / 2 : clamp(desiredX, minX, maxX)
        const y = minY > maxY ? worldH / 2 : clamp(desiredY, minY, maxY)

        return { x, y }
    }
}

function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v))
}

export default CameraFollow
