import { UIInterface } from "./main";
import {debug, debugOutput} from "../util";
import {FLAT} from "enable3d";

export class DevOverlay extends UIInterface {
    private sprite!: FLAT.TextSprite;

    create() {
        const tex = new FLAT.TextTexture("?", {fontSize: 28})
        this.sprite = new FLAT.TextSprite(tex);

        this.sprite.setDepth(1)
        this.sprite.setScale(1)
        this.addSprite(this.sprite)
        debug("test")
    }

    update() {
        const tex = new FLAT.TextTexture(debugOutput.join("\n"), {fontSize: 28})
        this.sprite.setTexture(tex);
        this.sprite.setScale(1);
        this.sprite.setPosition(this.sprite.textureWidth / 2, this.sprite.textureHeight / 2);
    }
}
