import { k } from "./game"
import { registerScenes } from "./scenes"
import { LEVELS } from "./constants"

registerScenes()

k.onLoad(() => {
    // k.go("game", LEVELS[0])
    k.go("menu")
})
