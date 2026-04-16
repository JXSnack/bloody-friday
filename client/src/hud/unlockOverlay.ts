import {UIInterface} from "./main";
import {FLAT} from "enable3d";

export class UnlockOverlay extends UIInterface {
    public static INSTANCE: UnlockOverlay = new UnlockOverlay();

    private activeMessages: {
        sprite: FLAT.TextSprite;
        since: number;
        duration: number;
        message: string;
        color: number;
    }[] = [];

    create() {}

    update() {
        const now = Date.now();

        for (let i = this.activeMessages.length - 1; i >= 0; i--) {
            const m = this.activeMessages[i];
            const progress = Math.min((now - m.since) / m.duration, 1);

            if (progress >= 1) {
                this.removeSprite(m.sprite);
                this.activeMessages.splice(i, 1);
                continue;
            }

            let scale: number;
            let alpha: number;

            if (progress < 0.45) {
                // Spring bounce-in with overshoot
                const t = progress / 0.45;
                scale = this.springBounce(t);
                alpha = Math.min(t * 4, 1);
            } else if (progress < 0.72) {
                // Hold: subtle breathing pulse
                const t = (progress - 0.45) / 0.27;
                scale = 1 + Math.sin(t * Math.PI * 3) * 0.045;
                alpha = 1;
            } else {
                // Fade out + shrink away
                const t = (progress - 0.72) / 0.28;
                const ease = t * t; // ease-in so it accelerates out
                scale = 1 - ease * 0.35;
                alpha = 1 - ease;
            }

            m.sprite.setScale(scale, scale);
            m.sprite.setTexture(this.makeTex(m.message, m.color, alpha));
            m.sprite.texture.needsUpdate = true;
        }
    }

    doMessage(message: string, color: number) {
        const sprite = new FLAT.TextSprite(this.makeTex(message, color, 0));

        sprite.setPosition(window.innerWidth / 2, window.innerHeight / 2);
        sprite.setScale(0, 0);
        sprite.setDepth(10);

        this.addSprite(sprite);
        this.activeMessages.push({
            sprite,
            since: Date.now(),
            duration: 2800,
            message,
            color,
        });
    }

    /** Damped spring: starts at 0, overshoots 1, settles at 1 */
    private springBounce(t: number): number {
        const decay = 5;
        const freq = 2.2;
        return 1 - Math.exp(-decay * t) * Math.cos(freq * Math.PI * t);
    }

    private makeTex(message: string, color: number, alpha: number): FLAT.TextTexture {
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;

        const styles: FLAT.TextStyles = {
            fontSize: 52,
            fontFamily: "RobotoReg",
            fontWeight: "bold",
            fillStyle: `rgba(${r}, ${g}, ${b}, ${alpha})`,
            strokeStyle: `rgba(0, 0, 0, ${alpha * 0.75})`,
            lineWidth: 7,
            // strokeWidth: 7,
        };

        return new FLAT.TextTexture(message, styles);
    }
}
