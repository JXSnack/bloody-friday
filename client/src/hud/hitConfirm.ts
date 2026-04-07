import {UIInterface} from "./main";
import {FLAT} from "enable3d";
import {debug} from "../util";

export class HitConfirmOverlay extends UIInterface {
    static readonly INSTANCE: HitConfirmOverlay = new HitConfirmOverlay();

    private sprites: {sprite: FLAT.TextSprite, duration: number, since: number, points: number}[] = [];

    create() {

    }

    update() {
        for (let sprite of this.sprites) {
            if (sprite.since + sprite.duration < Date.now()) {
                this.removeSprite(sprite.sprite);
                this.sprites.splice(this.sprites.indexOf(sprite), 1);
                debug("removed sprite")
                continue;
            }

            const progress = (Date.now() - sprite.since) / sprite.duration;
            sprite.sprite.setTexture(this.makeTex(sprite.points, {fillStyle: `rgba(${this.makeCol(sprite.points)}, ${1 - progress})`}))
            sprite.sprite.texture.needsUpdate = true;
        }
    }

    // points between 20 - 120
    doHit(points: number) {
        let multiplier = points / 120;

        const tex = this.makeTex(points, {});
        const sprite = new FLAT.TextSprite(tex);

        sprite.setScale(1, 1);
        sprite.setDepth(1);
        sprite.setPosition(window.innerWidth / 2 + Math.random() * 240 * 2 - 240, window.innerHeight / 2 + Math.random() * 240 * 2 - 240);

        this.addSprite(sprite);
        this.sprites.push({sprite: sprite, duration: multiplier * 6000, since: Date.now(), points: points});

        debug("did hit")
    }

    private makeTex(points: number, textStyles: FLAT.TextStyles): FLAT.TextTexture {
        let multiplier = points / 120;

        textStyles.fontSize = multiplier * 24 + 28;
        textStyles.fontFamily = "RobotoReg";
        textStyles.fillStyle ??= `rgb(${this.makeCol(points)}, 1)`;
        textStyles.fontWeight = "bold";
        return new FLAT.TextTexture("+" + points, textStyles);
    }

    private makeCol(points: number): string {
        let multiplier = points / 120;

        let r = multiplier * 255;
        let g = multiplier * 194;
        let b = multiplier * 51;

        return `${r}, ${g}, ${b}`
    }
}
