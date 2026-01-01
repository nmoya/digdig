import k from "./game";

class HUD {
    private collected: number;
    private total_gems: number;
    private current_bombs: number;
    private game_over: boolean;
    private win: boolean;
    private text: any;

    constructor(total_gems: number, bomb_count: number) {
        this.collected = 0;
        this.total_gems = total_gems;
        this.current_bombs = bomb_count;
        this.game_over = false;
        this.win = false;

        this.text = k.add([
            k.text("", { size: 18 }),
            k.pos(10, 10),
            k.fixed(),
            k.color(230, 230, 235),
        ]);

        this.updateHud();
    }

    restart(total_gems: number, bomb_count: number): void {
        this.collected = 0;
        this.current_bombs = bomb_count;
        this.total_gems = total_gems;
        this.game_over = false;
        this.win = false;
        this.updateHud();
    }
    
    updateHud(): void {
        const status = this.game_over ? "  GAME OVER (R to restart)" : this.win ? "  YOU WIN! (R to restart)" : "";
        this.text.text = `Diamonds: ${this.collected}/${this.total_gems}   Bombs: ${this.current_bombs}${status}`;
    }

    setCollected(count: number): void {
        this.collected = count;
        this.updateHud();
    }
    setBombs(count: number): void {
        this.current_bombs = count;
        this.updateHud();
    }

    setTotalGems(total: number): void {
        this.total_gems = total;
        this.updateHud();
    }
    setGameOver(over: boolean): void {
        this.game_over = over;
        this.updateHud();
    }
    setWin(win: boolean): void {
        this.win = win;
        this.updateHud();
    }
}

export default HUD;