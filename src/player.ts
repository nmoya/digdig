class Player {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    restart(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
}

export default Player;