import {UIInterface} from "./main";
import {FLAT} from "enable3d";
import {debug} from "../util";

export class KillOverlay extends UIInterface {
    static INSTANCE: KillOverlay = new KillOverlay();

    private sprite?: FLAT.DrawSprite;

    private text: string = "";
    private since: number = 0;

    private readonly duration = 5000;
    private readonly intro = 100; // ms

    private readonly width = 420;
    private readonly height = 70;

    create() {}

    doKilled(name: string) {
        this.text = `Killed: ${name}`;
        this.since = Date.now();

        if (!this.sprite) {
            this.sprite = new FLAT.DrawSprite(this.width, this.height, () => {});
            this.addSprite(this.sprite);
        }
    }

    update() {
        if (!this.sprite || this.since === 0) return;

        const now = Date.now();
        const elapsed = now - this.since;

        if (elapsed > this.duration) {
            this.removeSprite(this.sprite);
            this.sprite = undefined;
            this.since = 0;
            return;
        }

        const progress = elapsed / this.duration;

        // intro animation (0 → 1 over 0.2s)
        const introT = Math.min(1, elapsed / this.intro);
        const alpha = introT;

        // slide down 10px
        const yOffset = (1 - introT) * -10;

        this.sprite.setPosition(
            window.innerWidth / 2,
            20 + 120 + 20 + this.height / 2 + yOffset
        );

        this.redraw(alpha, progress);
    }

    private redraw(alpha: number, progress: number) {
        if (!this.sprite) return;

        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        const ctx = canvas.getContext("2d")!;

        // background
        ctx.fillStyle = `rgba(0,0,0,${0.6 * alpha})`;
        ctx.roundRect(0, 0, this.width, this.height, 8);
        ctx.fill();

        // text
        ctx.fillStyle = `rgba(255, 40, 40, ${alpha})`;
        ctx.font = "bold 22px RobotoReg";
        ctx.textAlign = "center";
        ctx.fillText(this.text, this.width / 2, 32);

        // timer bar background
        ctx.fillStyle = `rgba(255, 40, 40, ${0.2 * alpha})`;
        ctx.fillRect(0, this.height - 10, this.width, 10);

        // timer bar fill
        ctx.fillStyle = `rgba(255, 40, 40, ${alpha})`;
        ctx.fillRect(0, this.height - 10, this.width * (1 - progress), 10);

        const texture = (this.sprite as any).material.map;
        texture.image = ctx.getImageData(0, 0, this.width, this.height);
        texture.needsUpdate = true;
    }
}
