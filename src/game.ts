import kaplay from "kaplay"

const k: any = kaplay({
    width: 320,
    height: 192,
    letterbox: true,
    crisp: true,
    pixelDensity: 4,
    stretch: true,
    background: [15, 15, 18],
    global: false,
    debug: true,
    debugKey: "]",
})

k.loadRoot("./")
k.loadSprite("closed_door", `sprites/closed_door.png`)
k.loadSprite("dirt", `sprites/dirt_single.png`)
k.loadSprite("empty", `sprites/empty.png`)
k.loadSprite("gem", `sprites/gem.png`)
k.loadSprite("open_door", `sprites/open_door.png`)
k.loadSprite("player", `sprites/player.png`)
k.loadSprite("rock", `sprites/rock.png`)
k.loadSprite("wall", `sprites/wall.png`)


export default k
