import { k } from "./game"
import { registerScenes } from "./scenes"
import { LEVELS } from "./constants"

registerScenes()

k.onLoad(() => {
    // k.go("game", LEVELS[1])
    k.go("menu")
})
