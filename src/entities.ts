import { k } from "./game"

type RGB = [number, number, number]


class Entity {
    private levelCharacter: string
    private levelColor: RGB
    private spriteName: string

    constructor(levelCharacter: string, levelColor: RGB, spriteName: string) {
        this.levelCharacter = levelCharacter
        this.levelColor = levelColor
        this.spriteName = spriteName
    }

    getLevelCharacter(): string {
        return this.levelCharacter
    }

    getLevelColor(): [number, number, number] {
        return this.levelColor
    }

    getSprite(): any {
        // Kaplay components (like k.sprite()) are stateful and should not be reused
        // across multiple game objects. Always return a fresh component instance.
        return k.sprite(this.spriteName)
    }

    getSpriteName(): string {
        return this.spriteName
    }

    isPlayer(): boolean {
        const tmp = Entity.player()
        return this.levelCharacter === tmp.getLevelCharacter()
    }

    isEmpty(): boolean {
        const tmp = Entity.empty()
        return this.levelCharacter === tmp.getLevelCharacter()
    }

    isRock(): boolean {
        const tmp = Entity.rock()
        return this.levelCharacter === tmp.getLevelCharacter()
    }

    isGem(): boolean {
        const tmp = Entity.gem()
        return this.levelCharacter === tmp.getLevelCharacter()
    }

    isWall(): boolean {
        const tmp = Entity.wall()
        return this.levelCharacter === tmp.getLevelCharacter()
    }

    isDirt(): boolean {
        const tmp = Entity.dirt()
        return this.levelCharacter === tmp.getLevelCharacter()
    }

    isExitClosed(): boolean {
        const tmp = Entity.closedExit()
        return this.levelCharacter === tmp.getLevelCharacter()
    }

    isExitOpen(): boolean {
        const tmp = Entity.openExit()
        return this.levelCharacter === tmp.getLevelCharacter()
    }

    isWalkable(): boolean {
        return (
            this.isEmpty() ||
            this.isDirt() ||
            this.isGem() ||
            this.isExitOpen()
        )
    }

    isImmovable(): boolean {
        return this.isWall() || this.isExitClosed()
    }

    canFall(): boolean {
        return this.isRock() || this.isGem()
    }

    public static player(): Entity {
        return new Entity("@", [172, 50, 50], "player")
    }

    public static dirt(): Entity {
        return new Entity(".", [82, 75, 36], "dirt")
    }

    public static rock(): Entity {
        return new Entity("R", [155, 173, 183], "rock")
    }

    public static gem(): Entity {
        return new Entity("G", [106, 190, 48], "gem")
    }

    public static wall(): Entity {
        return new Entity("#", [46, 46, 46], "wall")
    }

    public static closedExit(): Entity {
        return new Entity("E", [105, 52, 18], "closed_door")
    }

    public static openExit(): Entity {
        return new Entity("O", [223, 113, 38], "open_door")
    }

    public static empty(): Entity {
        return new Entity(" ", [0, 0, 0], "empty")
    }
}

class EntityRegistry {
    private entitiesByChar: Map<string, Entity> = new Map()
    private entitiesByColor: Map<string, Entity> = new Map()
    private entitiesByName: Map<string, Entity> = new Map()

    registerEntity(entity: Entity): void {
        this.entitiesByChar.set(entity.getLevelCharacter(), entity)
        const color = entity.getLevelColor()
        const key = `${color[0]},${color[1]},${color[2]}`
        this.entitiesByColor.set(key, entity)
        this.entitiesByName.set(entity.getSpriteName(), entity)
    }

    byChar(c: string): Entity | null {
        return this.entitiesByChar.get(c) || null
    }

    byColor(color: [number, number, number]): Entity | null {
        const key = `${color[0]},${color[1]},${color[2]}`
        return this.entitiesByColor.get(key) || null
    }

    byName(name: string): Entity | null {
        return this.entitiesByName.get(name) || null
    }

    rock(): Entity {
        const tmp = Entity.rock()
        return this.byChar(tmp.getLevelCharacter())!
    }

    wall(): Entity {
        const tmp = Entity.wall()
        return this.byChar(tmp.getLevelCharacter())!
    }

    empty(): Entity {
        const tmp = Entity.empty()
        return this.byChar(tmp.getLevelCharacter())!
    }

    openExit(): Entity {
        const tmp = Entity.openExit()
        return this.byChar(tmp.getLevelCharacter())!
    }

    closedExit(): Entity {
        const tmp = Entity.closedExit()
        return this.byChar(tmp.getLevelCharacter())!
    }

    player(): Entity {
        const tmp = Entity.player()
        return this.byChar(tmp.getLevelCharacter())!
    }
}

const registry = new EntityRegistry()
registry.registerEntity(Entity.player())
registry.registerEntity(Entity.dirt())
registry.registerEntity(Entity.rock())
registry.registerEntity(Entity.gem())
registry.registerEntity(Entity.wall())
registry.registerEntity(Entity.closedExit())
registry.registerEntity(Entity.openExit())
registry.registerEntity(Entity.empty())

console.log("Registered entities:", Array.from(registry["entitiesByChar"].keys()))
export { Entity, EntityRegistry, RGB, registry }