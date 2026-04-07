import {Game} from "../util";
import {Object3D} from "three";

export class UIInterface {
    create() {}
    update() {}

    addSprite(sprite: Object3D) {
        Game.hud!.scene.add(sprite)
    }

    removeSprite(sprite: Object3D) {
        Game.hud!.scene.remove(sprite);
    }
}
