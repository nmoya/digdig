import { INITIAL_BOMB_COUNT, TICK_SECS } from "./constants"
import GravityManager from "./gravityManager"
import HUD from "./hud"
import LevelRenderer from "./levelRenderer"
import Player from "./player"
import { Entity, registry } from "./entities"
import { LogInOut } from "./debug"
import type InputController from "./input"

class GameLogic {
    private collected = 0
    private bombs = INITIAL_BOMB_COUNT
    private gameOver = false
    private win = false
    private totalDiamonds: number
    private tickAccSecs = 0

    private gravity: GravityManager

    constructor(
        private renderer: LevelRenderer,
        private player: Player,
        private hud: HUD,
    ) {
        this.totalDiamonds = renderer.getTotalGems()
        this.gravity = new GravityManager(renderer)
        this.gravity.initialize()
    }

    canRockBePushed(dx: number, dy: number, destCell: Entity, nx: number, ny: number): boolean {
        return (
            dy === 0 &&
            destCell.isRock() &&
            this.renderer.cell(nx + dx, ny).isEmpty()
        )
    }

    pushRock(dx: number, nx: number, ny: number): void {
        const pushX = nx + dx
        const pushY = ny
        this.renderer.setCell(pushX, pushY, registry.rock())
        this.renderer.setCell(nx, ny, registry.empty())
        this.renderer.drawCell(pushX, pushY)
        this.renderer.drawCell(nx, ny)
        this.gravity.onRockPushed(nx, ny, pushX, pushY)
    }

    collectDiamond(): void {
        this.collected++
        this.hud.setCollected(this.collected)
    }

    bindInput(input: InputController): () => void {
        const unsubscribers = [
            input.subscribe("move", ({ action }) => {
                switch (action) {
                    case "moveUp":
                        this.movePlayer(0, -1)
                        break
                    case "moveDown":
                        this.movePlayer(0, 1)
                        break
                    case "moveLeft":
                        this.movePlayer(-1, 0)
                        break
                    case "moveRight":
                        this.movePlayer(1, 0)
                        break
                }
            }),
            input.subscribe("bomb", () => this.useBomb()),
            input.subscribe("restart", () => this.restart()),
            input.subscribe("winLevel", () => this.winLevel()),
        ]

        return () => {
            for (const unsubscribe of unsubscribers) {
                unsubscribe()
            }
        }
    }

    @LogInOut
    movePlayer(deltaX: number, deltaY: number): void {
        if (this.gameOver || this.win) return

        const newX = this.player.x + deltaX
        const newY = this.player.y + deltaY
        const destinationCell = this.renderer.cell(newX, newY)

        if (destinationCell.isImmovable()) return
        if (destinationCell.isRock()) {
            if (this.canRockBePushed(deltaX, deltaY, destinationCell, newX, newY)) {
                this.pushRock(deltaX, newX, newY)
            } else {
                return
            }
        }

        if (destinationCell.isGem()) {
            this.collectDiamond()
            if (this.collected >= this.totalDiamonds) {
                this.renderer.openExit()
            }
        }

        if (destinationCell.isExitOpen()) {
            this.winLevel()
            return
        }

        if (destinationCell.isWalkable()) {
            const oldX = this.player.x
            const oldY = this.player.y

            this.renderer.setCell(this.player.x, this.player.y, registry.empty())
            this.renderer.drawCell(this.player.x, this.player.y)

            this.player.x = newX
            this.player.y = newY

            this.renderer.setCell(newX, newY, registry.player())
            this.renderer.drawCell(newX, newY)

            this.gravity.onPlayerMoved(oldX, oldY, newX, newY)
        }
    }

    useBomb(): void {
        if (this.gameOver || this.win) return
        if (this.bombs <= 0) return

        this.bombs--

        const cx = this.player.x
        const cy = this.player.y

        // 3x3 blast (doesn't remove walls)
        let y = cy - 1
        while (y <= cy + 1) {
            let x = cx - 1
            while (x <= cx + 1) {
                if (!this.renderer.inBounds(x, y)) {
                    x++
                    continue
                }
                const t = this.renderer.cell(x, y)
                if (t.isWall()) {
                    x++
                    continue
                }
                if (t.isExitOpen()) {
                    x++
                    continue
                }

                if (x === cx && y === cy) {
                    this.renderer.setCell(x, y, registry.empty())
                    this.renderer.drawCell(x, y)
                    this.gameOver = true
                    this.hud.setGameOver(true)
                    this.gravity.onCellCleared(x, y)
                    x++
                    continue
                }

                if (t.isGem()) {
                    this.totalDiamonds = Math.max(0, this.totalDiamonds - 1)
                    this.hud.setTotalGems(this.totalDiamonds)
                    if (this.collected >= this.totalDiamonds) {
                        this.renderer.openExit()
                    }
                }

                this.renderer.setCell(x, y, registry.empty())
                this.renderer.drawCell(x, y)
                this.gravity.onCellCleared(x, y)
                x++
            }
            y++
        }

        this.hud.setBombs(this.bombs)
    }

    applyGravity(): void {
        if (this.gameOver || this.win) return

        const killedPlayer = this.gravity.tick()
        if (killedPlayer) {
            this.gameOver = true
            this.hud.setGameOver(true)
        }
    }

    @LogInOut
    restart(): void {
        this.renderer.restart()
        this.player.restart(...this.renderer.getInitialPlayerPosition())
        this.collected = 0
        this.bombs = INITIAL_BOMB_COUNT
        this.gameOver = false
        this.win = false
        this.totalDiamonds = this.renderer.getTotalGems()
        this.hud.restart(this.totalDiamonds, this.bombs)
        this.gravity.initialize()
    }

    isGameOver(): boolean {
        return this.gameOver
    }

    winLevel(): void {
        this.win = true
        this.hud.setWin(true)
    }

    didWin(): boolean {
        return this.win
    }

    update(dt: number): void {
        this.tickAccSecs += dt
        while (this.tickAccSecs >= TICK_SECS) {
            this.tickAccSecs -= TICK_SECS
            this.applyGravity()
        }
    }
}

export default GameLogic
