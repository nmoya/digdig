import { GameObj } from "kaplay";
import k from "./game";

export const TILE: number = 16;
export const TICK_SECS: number = 0.12;
export const PLAYER_MOVE_SPEED: number = 1 / TICK_SECS; // in (moves/tiles per second)
export const INITIAL_BOMB_COUNT: number = 3;

export const C = {
    Empty: " ",
    Wall: "#",
    Dirt: ".",
    Rock: "R",
    Diamond: "D",
    ExitClosed: "E",
    ExitOpen: "O",
    Player: "@",
} as const;

type CellType = typeof C[keyof typeof C];

export const COLORS: { [key in CellType]?: [number, number, number] | null } = {
    [C.Empty]: null,
    [C.Wall]: [90, 92, 96],
    [C.Dirt]: [120, 85, 55],
    [C.Rock]: [145, 145, 150],
    [C.Diamond]: [80, 190, 255],
    [C.ExitClosed]: [160, 60, 60],
    [C.ExitOpen]: [60, 200, 100],
    [C.Player]: [255, 235, 130],
};

export const SPRITES: { [key in CellType]?: GameObj } = {
    [C.Empty]: k.sprite("empty"),
    [C.Wall]: k.sprite("wall"),
    [C.Dirt]: k.sprite("dirt"),
    [C.Rock]: k.sprite("rock"),
    [C.Diamond]: k.sprite("gem"),
    [C.ExitClosed]: k.sprite("closed_door"),
    [C.ExitOpen]: k.sprite("open_door"),
    [C.Player]: k.sprite("player"),
};

export const LEVEL: string[] = [
    "############################",
    "#............D....R.......#",
    "#..RR.....#######.....D...#",
    "#..........#.....#.........#",
    "#..@.......#..D..#....R....#",
    "#..........#.....#.........#",
    "#.....D....#######.....D..E#",
    "#............R............##",
    "#..........................#",
    "############################",
];


// export const LEVEL: string[] = [
//     "##",
//     "#.",
// ];
