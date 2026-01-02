import { Entity, registry } from "./entities";

class Level {
    cells: Entity[][] = [];

    private constructor() { }

    public static async loadLevel(filepath: string): Promise<Level> {
        const level = new Level();
        const res = await fetch(filepath);
        if (!res.ok) {
            throw new Error(`Failed to load level image: ${filepath} (${res.status} ${res.statusText})`);
        }

        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Failed to create 2D canvas context");
        ctx.drawImage(bitmap, 0, 0);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const width = canvas.width;
        const height = canvas.height;

        let playerCount = 0;
        let exitCount = 0;

        for (let y = 0; y < height; y++) {
            level.cells.push([]);
            for (let x = 0; x < width; x++) {
                level.cells[y].push(registry.empty());
            }
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const r = data[i + 0] ?? 0;
                const g = data[i + 1] ?? 0;
                const b = data[i + 2] ?? 0;
                const a = data[i + 3] ?? 0;


                const entity = registry.byColor([r, g, b]);
                if (!entity) {
                    throw new Error(
                        `Unknown level color at (${x},${y}): rgb(${r},${g},${b}). ` +
                        `Add it to COLORS mapping or paint with existing palette colors.`
                    );
                }
                if (entity.isPlayer()) {
                    playerCount++;
                }
                if (entity.isExitClosed() || entity.isExitOpen()) {
                    exitCount++;
                }
                level.cells[y][x] = entity;
            }
        }

        if (playerCount !== 1) {
            throw new Error(`Level must contain exactly 1 player start; found ${playerCount}`);
        }
        if (exitCount !== 1) {
            throw new Error(`Level must contain exactly 1 exit; found ${exitCount}`);
        }

        return level;
    }

    totalGems(): number {
        return this.cells.reduce((acc, row) => {
            return acc + row.reduce((rowAcc, cell) => {
                return rowAcc + (cell.isGem() ? 1 : 0);
            }, 0);
        }, 0);
    }

    exitPosition(): [number, number] {
        for (let y = 0; y < this.cells.length; y++) {
            for (let x = 0; x < this.cells[0].length; x++) {
                if (this.cells[y][x].isExitClosed() || this.cells[y][x].isExitOpen()) {
                    return [x, y];
                }
            }
        }
        throw new Error("No exit found in level");
    }

    playerPosition(): [number, number] {
        for (let y = 0; y < this.cells.length; y++) {
            for (let x = 0; x < this.cells[0].length; x++) {
                if (this.cells[y][x].isPlayer()) {
                    return [x, y];
                }
            }
        }
        throw new Error("No player start found in level");
    }

    getWidth(): number {
        return this.cells[0].length;
    }

    getHeight(): number {
        return this.cells.length;
    }

    cloneCells(): Entity[][] {
        return this.cells.map(row => row.slice());
    }

    static async fromImage(filepath: string): Promise<Level> {
        return Level.loadLevel(filepath);
    }
}

export default Level;