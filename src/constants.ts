export const TILE: number = 16
export const TICK_SECS: number = 0.12
export const PLAYER_MOVE_SPEED: number = 100 // smaller is faster
export const INITIAL_BOMB_COUNT: number = 3
export const HUD_BAR_HEIGHT: number = 8


export type LevelConfig = {
    id: string
    name: string
    url: string
    next: string | null
}

export const LEVELS: LevelConfig[] = [
    { id: "level1", name: "Level 1", url: "levels/level1.png", next: "level2" },
    { id: "level2", name: "Level 2", url: "levels/level2.png", next: "level3" },
    { id: "level3", name: "Level 3", url: "levels/level3.png", next: null },
]