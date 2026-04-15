import { UIInterface } from "./main";
import {debug, debugOutput, Game} from "../util";
import {FLAT} from "enable3d";

export class DevOverlay extends UIInterface {
    private sprite!: FLAT.TextSprite;
    private position!: FLAT.TextSprite;
    private visible: boolean = false;

    create() {
        const tex = new FLAT.TextTexture("?", {fontSize: 28})
        this.sprite = new FLAT.TextSprite(tex);

        this.sprite.setDepth(1)
        this.sprite.setScale(1)
        this.addSprite(this.sprite)

        const pTex = new FLAT.TextTexture("?", {fontSize: 28})
        this.position = new FLAT.TextSprite(pTex);

        this.position.setDepth(1);
        this.position.setScale(1);
        this.addSprite(this.position);

        debug("dev overlay ready")
    }

    update() {
        if (Game.keys["AltLeft"] && Game.keys["KeyD"]) {
            Game.keys["AltLeft"] = false;
            Game.keys["KeyD"] = false;
            this.visible = !this.visible;
        }

        if (Game.keys["AltLeft"] && Game.keys["KeyC"]) {
            let pos = Game.self!.getPos();
            let rot = Game.self!.getRot();
            navigator.clipboard.writeText(`{pos: new Vec(${pos.x}, ${pos.y}, ${pos.z}), rot: new Vec(${rot.x}, ${rot.y}, ${rot.z})}`).then(() => {
                debug("Saved location to clipboard")
            });
        }

        this.sprite.visible = this.visible;
        this.position.visible = this.visible;

        if (!this.visible) return;

        const tex = new FLAT.TextTexture(debugOutput.join("\n"), {fontSize: 28})
        this.sprite.setTexture(tex);
        this.sprite.setScale(1);
        this.sprite.setPosition(this.sprite.textureWidth / 2, this.sprite.textureHeight / 2);

        if (Game.self) {
            const pTex = new FLAT.TextTexture(JSON.stringify(Game.self!.getPos()), {fontSize: 28})
            this.position.setTexture(pTex);
            this.position.setScale(1);
            this.position.setPosition(window.innerWidth / 2, window.innerHeight - this.position.textureHeight - 48);
        }
    }
}
