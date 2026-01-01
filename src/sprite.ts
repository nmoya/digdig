import k from "./game";

class Sprite {
    private obj: any;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color: [number, number, number]
    ) {
        this.obj = k.add([
            k.rect(width, height),
            k.pos(x, y),
            k.color(...color),
        ]);
    }

    setPosition(x: number, y: number) {
        this.obj.pos = k.vec2(x, y);
    }

    setColor(color: [number, number, number]) {
        this.obj.color = k.rgb(...color);
    }

    destroy() {
        this.obj.destroy();
    }
}

export default Sprite;