import Level from "./level"
import k from "./game"
import { registry, Entity } from "./entities"


class LevelRenderer {
    private level: Level
    private tileSize: number
    private offsetY: number

    private mutableEntities: Entity[][]

    private vis: (any | null)[][]
    private totalGems: number = 0

    constructor(level: Level, tileSize: number, offsetY: number = 0) {
        this.level = level
        this.tileSize = tileSize
        this.offsetY = offsetY
        this.vis = this.initVisGrid()
        this.mutableEntities = level.cloneCells()
        this.closeExit()

        this.totalGems = this.level.totalGems()
    }

    restart(): void {
        this.vis = this.initVisGrid()
        this.redrawAll()
    }

    getInitialPlayerPosition(): [number, number] {
        return this.level.playerPosition()
    }

    openExit(): void {
        const [ex, ey] = this.level.exitPosition()
        this.setCell(ex, ey, registry.openExit())
        this.drawCell(ex, ey)
    }

    closeExit(): void {
        const [ex, ey] = this.level.exitPosition()
        this.setCell(ex, ey, registry.closedExit())
        this.drawCell(ex, ey)
    }

    getTotalGems(): number {
        return this.totalGems
    }

    initVisGrid(): (any | null)[][] {
        return Array.from({ length: this.level.getHeight() }, () =>
            Array.from({ length: this.level.getWidth() }, () => null)
        )
    }

    inBounds(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.level.getWidth() && y < this.level.getHeight()
    }

    getWidth(): number {
        return this.level.getWidth()
    }

    getHeight(): number {
        return this.level.getHeight()
    }

    cell(x: number, y: number): Entity {
        if (!this.inBounds(x, y)) return registry.wall()
        return this.mutableEntities[y][x]
    }

    setCell(x: number, y: number, v: Entity): void {
        if (!this.inBounds(x, y)) return
        this.mutableEntities[y][x] = v
    }

    killVis(x: number, y: number): void {
        const o = this.vis[y][x]
        if (o) o.destroy()
        this.vis[y][x] = null
    }

    drawCell(x: number, y: number): void {
        this.killVis(x, y)
        const t = this.cell(x, y)
        this.vis[y][x] = k.add([
            k.pos(x * this.tileSize, y * this.tileSize + this.offsetY),
            t.getSprite(),
        ])
    }

    redrawAll(): void {
        let y = 0
        while (y < this.level.getHeight()) {
            let x = 0
            while (x < this.level.getWidth()) {
                this.drawCell(x, y)
                x++
            }
            y++
        }
    }
}


export default LevelRenderer