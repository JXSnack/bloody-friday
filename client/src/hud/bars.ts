import {UIInterface} from "./main";
import {FLAT} from "enable3d";
import {debug, Game} from "../util";

export class BarsOverlay extends UIInterface {
    private crosshair: FLAT.SimpleSprite | undefined;

    create() {
        if (Game.world == null) return;

        Game.world.load.texture("/crosshair.png").then((tx) => {
            debug("crosshair ready")
            this.crosshair = new FLAT.SimpleSprite(tx);
            this.addSprite(this.crosshair);
        });
    }

    update() {
        if (this.crosshair != null) {
            this.crosshair.setPosition(window.innerWidth / 2, window.innerHeight / 2)
            this.crosshair.setScale(0.05)
        }
    }
}
