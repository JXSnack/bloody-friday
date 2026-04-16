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
        vy: number,
        kind: 'hit' | 'friendly',
        label: string
    }[] = [];

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
            const ease = 1 - Math.pow(progress, 2);

            const pos = s.sprite.position;
            pos.x += s.vx * ease * 10;
            pos.y += s.vy * ease * 10;
            pos.y -= 0.3;

            const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
            s.sprite.setScale(scale, scale);

            if (s.kind === 'friendly') {
                s.sprite.setTexture(
                    this.makeTex(0, {
                        fillStyle: `rgba(255, 0, 0, ${alpha})`
                    }, s.label)
                );
            } else {
                s.sprite.setTexture(
                    this.makeTex(s.points, {
                        fillStyle: `rgba(${this.makeCol(s.points)}, ${alpha})`
                    })
                );
            }

            s.sprite.texture.needsUpdate = true;
        }
    }

    doHit(points: number) {
        const multiplier = points / 50;

        const tex = this.makeTex(points, {});
        const sprite = new FLAT.TextSprite(tex);

        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        const x = cx + Math.random() * 240 - 120;
        const y = cy + Math.random() * 240 - 120;

        sprite.setPosition(x, y);
        sprite.setScale(1, 1);
        sprite.setDepth(1);

        const dx = x - cx;
        const dy = y - cy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const speed = 0.2 + Math.random() * 0.8;

        this.addSprite(sprite);
        this.sprites.push({
            sprite,
            duration: 1000 + multiplier * 2000,
            since: Date.now(),
            points,
            vx: (dx / len) * speed,
            vy: (dy / len) * speed,
            kind: 'hit',
            label: `+${points}`
        });
    }

    doFriendlyFire() {
        const sprite = new FLAT.TextSprite(
            this.makeTex(0, {
                fillStyle: `rgba(255, 0, 0, 1)`
            }, "Friendly fire!")
        );

        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        const x = cx + Math.random() * 200 - 100;
        const y = cy + Math.random() * 200 - 100;

        sprite.setPosition(x, y);
        sprite.setScale(1, 1);
        sprite.setDepth(1);

        const dx = x - cx;
        const dy = y - cy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const speed = 0.4;

        this.addSprite(sprite);
        this.sprites.push({
            sprite,
            duration: 1200,
            since: Date.now(),
            points: 0,
            vx: (dx / len) * speed,
            vy: (dy / len) * speed,
            kind: 'friendly',
            label: "Friendly fire!"
        });
    }

    private makeTex(
        points: number,
        textStyles: FLAT.TextStyles,
        label: string = "+" + points
    ): FLAT.TextTexture {
        const multiplier = points / 50;

        textStyles.fontSize = multiplier * 24 + 28;
        textStyles.fontFamily = "RobotoReg";
        textStyles.fillStyle ??= `rgb(${this.makeCol(points)}, 1)`;
        textStyles.fontWeight = "bold";

        return new FLAT.TextTexture(label, textStyles);
    }

    private makeCol(points: number): string {
        const multiplier = points / 50;

        const r = multiplier * 255;
        const g = multiplier * 194;
        const b = multiplier * 51;

        return `${r}, ${g}, ${b}`;
    }
}
