import {C, COLORS} from "./constants";
import k from "./game";


class LevelRenderer {
    private rawLevel: string[];
    private tileSize: bigint;
    private width: number;
    private height: number;

    private vis: (any | null)[][];
    private grid: string[][];
    private initialPlayerXY: [number, number];
    private exitXY: [number, number];
    private totalGems: number = 0;

    constructor(rawLevel: string[], tileSize: bigint) {
        this.rawLevel = rawLevel;
        this.tileSize = tileSize;

        this.width = rawLevel[0].length;
        this.height = rawLevel.length;

        this.grid = this.gridFromRawLevel();
        this.totalGems = this.countGemsInLevel();
        this.initialPlayerXY = this.findInitialPlayerPosition();
        this.exitXY = this.findExitPosition();
        this.vis = this.initVisGrid();

    }

    restart(): void {
        this.grid = this.gridFromRawLevel();
        this.vis = this.initVisGrid();
        this.redrawAll();
    }

    countGemsInLevel(): number {
        let count = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === C.Diamond) {
                    count++;
                }
            }
        }
        return count;
    }

    getInitialPlayerPosition(): [number, number] {
        return this.initialPlayerXY;
    }

    findExitPosition(): [number, number] {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === C.ExitClosed) {
                    return [x, y];
                }
            }
        }
        new Error("No exit found in level");
        return [0, 0];
    }

    openExit(): void {
        const [ex, ey] = this.exitXY;
        this.setCell(ex, ey, C.ExitOpen);
        this.drawCell(ex, ey);
    }

    findInitialPlayerPosition(): [number, number] {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === C.Player) {
                    return [x, y];
                }
            }
        }
        new Error("No player start position found in level");
        return [0, 0];
    }

    getTotalGems(): number {
        return this.totalGems;
    }

    gridFromRawLevel(): string[][] {
        return Array.from({ length: this.height }, (_, y) =>
            Array.from({ length: this.width }, (_, x) => {
                const ch = this.rawLevel[y][x] ?? C.Empty;
                return ch;
            })
        );
    }

    initVisGrid(): (any | null)[][] {
        return Array.from({ length: this.height }, () =>
            Array.from({ length: this.width }, () => null)
        );
    }

    inBounds(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }

    cell(x: number, y: number): string {
        if (!this.inBounds(x, y)) return C.Wall;
        return this.grid[y][x];
    }

    setCell(x: number, y: number, v: string): void {
        if (!this.inBounds(x, y)) return;
        this.grid[y][x] = v;
    }

    killVis(x: number, y: number): void {
        const o = this.vis[y][x];
        if (o) o.destroy();
        this.vis[y][x] = null;
    }

    drawCell(x: number, y: number): void {
        this.killVis(x, y);
        const t = this.cell(x, y);
        if (t === C.Empty) return;
        const col = COLORS[t as keyof typeof COLORS] ?? [255, 255, 255];
        this.vis[y][x] = k.add([
            k.rect(Number(this.tileSize) - 1, Number(this.tileSize) - 1),
            k.pos(x * Number(this.tileSize), y * Number(this.tileSize)),
            k.color(col[0], col[1], col[2]),
            k.outline(1, k.rgb(0, 0, 0)),
        ]);
    }

    redrawAll(): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.drawCell(x, y);
            }
        }
    }
}


export default LevelRenderer;