import { C, INITIAL_BOMB_COUNT, TICK_SECS } from "./constants";
import HUD from "./hud";
import LevelRenderer from "./levelRenderer";
import Player from "./player";

class GameLogic {
    private collected = 0;
    private bombs = INITIAL_BOMB_COUNT;
    private gameOver = false;
    private win = false;
    private totalDiamonds: number;
    private tickAccSecs = 0;

    constructor(
        private renderer: LevelRenderer,
        private player: Player,
        private hud: HUD,
    ) {
        this.totalDiamonds = renderer.getTotalGems();
    }

    isDestinationWalkable(t: string): boolean {
        return (
            t === C.Empty ||
            t === C.Dirt ||
            t === C.Diamond ||
            t === C.ExitOpen
        );
    }

    isDestinationBlocked(t: string): boolean {
        return t === C.Wall || t === C.ExitClosed;
    }

    canRockBePushed(dx: number, dy: number, destCell: string, nx: number, ny: number): boolean {
        return (
            dy === 0 && // only horizontal pushing
            destCell === C.Rock && // destination is rock
            this.renderer.cell(nx + dx, ny) === C.Empty // cell beyond rock is empty
        );
    }

    pushRock(dx: number, nx: number, ny: number): void {
        const pushX = nx + dx;
        const pushY = ny;
        this.renderer.setCell(pushX, pushY, C.Rock);
        this.renderer.setCell(nx, ny, C.Empty);
        this.renderer.drawCell(pushX, pushY);
        this.renderer.drawCell(nx, ny);
    }

    walkingIntoRock(destinationCell: string): boolean {
        return destinationCell === C.Rock;
    }

    walkingIntoDiamond(destinationCell: string): boolean {
        return destinationCell === C.Diamond;
    }

    collectDiamond(): void {
        this.collected++;
        this.hud.setCollected(this.collected);
    }

    walkingIntoOpenExit(destinationCell: string): boolean {
        return destinationCell === C.ExitOpen;
    }

    movePlayer(deltaX: number, deltaY: number): void {
        if (this.gameOver || this.win) return;

        const newX = this.player.x + deltaX;
        const newY = this.player.y + deltaY;
        const destinationCell = this.renderer.cell(newX, newY);

        if (this.isDestinationBlocked(destinationCell)) return;
        if (this.walkingIntoRock(destinationCell)) {
            if (this.canRockBePushed(deltaX, deltaY, destinationCell, newX, newY)) {
                this.pushRock(deltaX, newX, newY);
            } else {
                return;
            }
        }

        if (this.walkingIntoDiamond(destinationCell)) {
            this.collectDiamond();
            if (this.collected >= this.totalDiamonds) {
                this.renderer.openExit();
            }
        }

        if (this.walkingIntoOpenExit(destinationCell)) {
            this.win = true;
            this.hud.setWin(true);
            return;
        }

        if (this.isDestinationWalkable(destinationCell)) {
            this.renderer.setCell(this.player.x, this.player.y, C.Empty);
            this.renderer.drawCell(this.player.x, this.player.y);

            this.player.x = newX;
            this.player.y = newY;

            this.renderer.setCell(newX, newY, C.Player);
            this.renderer.drawCell(newX, newY);
        }
    }

    useBomb(): void {
        if (this.gameOver || this.win) return;
        if (this.bombs <= 0) return;

        this.bombs--;

        const cx = this.player.x;
        const cy = this.player.y;

        // 3x3 blast (doesn't remove walls)
        for (let y = cy - 1; y <= cy + 1; y++) {
            for (let x = cx - 1; x <= cx + 1; x++) {
                if (!this.renderer.inBounds(x, y)) continue;
                const t = this.renderer.cell(x, y);
                if (t === C.Wall) continue;
                // Don't delete open exit (optional choice)
                if (t === C.ExitOpen) continue;

                // If we blast ourselves -> lose
                if (x === cx && y === cy) {
                    this.renderer.setCell(x, y, C.Empty);
                    this.renderer.drawCell(x, y);
                    this.gameOver = true;
                    this.hud.setGameOver(true);
                    continue;
                }

                // If we blast diamonds, reduce requirement so the level remains completable
                if (t === C.Diamond) {
                    this.totalDiamonds = Math.max(0, this.totalDiamonds - 1);
                    this.hud.setTotalGems(this.totalDiamonds);
                    if (this.collected >= this.totalDiamonds) {
                        this.renderer.openExit();
                    }
                }

                this.renderer.setCell(x, y, C.Empty);
                this.renderer.drawCell(x, y);
            }
        }

        this.hud.setBombs(this.bombs);
    }

    applyGravity(): void {
        if (this.gameOver || this.win) return;

        const grid: string[][] = (this.renderer as any).grid;
        const height = grid.length;
        const width = height > 0 ? grid[0].length : 0;

        for (let y = height - 2; y >= 0; y--) {
            for (let x = 0; x < width; x++) {
                const t = this.renderer.cell(x, y);
                if (t !== C.Rock && t !== C.Diamond) continue;

                const below = this.renderer.cell(x, y + 1);

                if (below === C.Player) {
                    this.renderer.setCell(x, y, C.Empty);
                    this.renderer.setCell(x, y + 1, t);
                    this.renderer.drawCell(x, y);
                    this.renderer.drawCell(x, y + 1);
                    this.gameOver = true;
                    this.hud.setGameOver(true);
                    continue;
                }

                if (below === C.Empty) {
                    this.renderer.setCell(x, y, C.Empty);
                    this.renderer.setCell(x, y + 1, t);
                    this.renderer.drawCell(x, y);
                    this.renderer.drawCell(x, y + 1);
                }
            }
        }
    }

    restart(): void {
        this.renderer.restart();
        this.player.restart(...this.renderer.getInitialPlayerPosition());
        this.collected = 0;
        this.bombs = INITIAL_BOMB_COUNT;
        this.gameOver = false;
        this.win = false;
        this.totalDiamonds = this.renderer.getTotalGems();
        this.hud.restart(this.totalDiamonds, this.bombs);
    }

    isGameOver(): boolean {
        return this.gameOver;
    }

    didWin(): boolean {
        return this.win;
    }

    update(dt: number): void {
        this.tickAccSecs += dt;
        while (this.tickAccSecs >= TICK_SECS) {
            this.tickAccSecs -= TICK_SECS;
            this.applyGravity();
        }
    }
}

export default GameLogic;
