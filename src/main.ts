import { k } from "./game"
import { registerScenes } from "./scenes"

registerScenes()

k.onLoad(() => {
    k.go("menu")
})
