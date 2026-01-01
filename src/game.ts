import kaplay from "kaplay";

const k: any = kaplay({
    width: 320,
    height: 192,
    letterbox: true,
    crisp: true,
    pixelDensity: 1,
    stretch: true,
    background: [15, 15, 18],
    global: false,
    debug: true,
    debugKey: "]",
});

k.loadRoot("./");
k.loadSprite("closed_door", `assets/images/closed_door.png`);
k.loadSprite("dirt", `assets/images/dirt_single.png`);
k.loadSprite("empty", `assets/images/empty.png`);
k.loadSprite("gem", `assets/images/gem.png`);
k.loadSprite("open_door", `assets/images/open_door.png`);
k.loadSprite("player", `assets/images/player.png`);
k.loadSprite("rock", `assets/images/rock.png`);
k.loadSprite("wall", `assets/images/wall.png`);


export default k;
