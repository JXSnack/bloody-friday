import {UIInterface} from "./main";
import {FLAT} from "enable3d";
import {debug} from "../util";

export class HitConfirmOverlay extends UIInterface {
    static readonly INSTANCE: HitConfirmOverlay = new HitConfirmOverlay();

    private sprites: {
        sprite: FLAT.TextSprite,
        duration: number,
        since: number,
        points: number,
        vx: number,
        vy: number
    }[] = [];

    create() {

    }

    update() {
        const now = Date.now();

        for (let i = this.sprites.length - 1; i >= 0; i--) {
            const s = this.sprites[i];

            const progress = (now - s.since) / s.duration;
            if (progress >= 1) {
                this.removeSprite(s.sprite);
                this.sprites.splice(i, 1);
                continue;
            }

            const alpha = Math.max(0, 1 - progress);

            // movement (ease out)
            const ease = 1 - Math.pow(progress, 2);

            const pos = s.sprite.position;
            pos.x += s.vx * ease * 10;
            pos.y += s.vy * ease * 10;

            // slight upward drift (classic shooter feel)
            pos.y -= 0.3;

            // scale pop then shrink
            const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
            s.sprite.setScale(scale, scale);

            // update color/alpha
            s.sprite.setTexture(
                this.makeTex(s.points, {
                    fillStyle: `rgba(${this.makeCol(s.points)}, ${alpha})`
                })
            );
            s.sprite.texture.needsUpdate = true;
        }
    }

    // points between 20 - 50
    doHit(points: number) {
        const multiplier = points / 50;

        const tex = this.makeTex(points, {});
        const sprite = new FLAT.TextSprite(tex);

        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        const x = cx + Math.random() * 240 - 240/2;
        const y = cy + Math.random() * 240 - 240/2;

        sprite.setPosition(x, y);
        sprite.setScale(1, 1);
        sprite.setDepth(1);

        // direction away from center
        const dx = x - cx;
        const dy = y - cy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const speed = 0.2 + Math.random() * 0.8;

        const vx = (dx / len) * speed;
        const vy = (dy / len) * speed;

        this.addSprite(sprite);
        this.sprites.push({
            sprite,
            duration: 1000 + multiplier * 2000,
            since: Date.now(),
            points,
            vx,
            vy
        });
    }

    private makeTex(points: number, textStyles: FLAT.TextStyles): FLAT.TextTexture {
        let multiplier = points / 50;

        textStyles.fontSize = multiplier * 24 + 28;
        textStyles.fontFamily = "RobotoReg";
        textStyles.fillStyle ??= `rgb(${this.makeCol(points)}, 1)`;
        textStyles.fontWeight = "bold";
        return new FLAT.TextTexture("+" + points, textStyles);
    }

    private makeCol(points: number): string {
        let multiplier = points / 50;

        let r = multiplier * 255;
        let g = multiplier * 194;
        let b = multiplier * 51;

        return `${r}, ${g}, ${b}`
    }
}
