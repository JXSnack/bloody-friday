import {UIInterface} from "./main";
import {FLAT} from "enable3d";

export class FadeOverlay extends UIInterface {
    public static INSTANCE: FadeOverlay = new FadeOverlay();
    private DARKEN_SPRITE!: FLAT.DrawSprite;

    private fadeMode: "idle" | "fadeIn" | "fadeOut" = "idle";
    private fadeStart = 0;
    private fadeDuration = 1000;

    create() {
        this.DARKEN_SPRITE = new FLAT.DrawSprite(window.innerWidth, window.innerHeight, (ctx) => {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        });
        this.DARKEN_SPRITE.setPosition(window.innerWidth / 2, window.innerHeight / 2);

        this.addSprite(this.DARKEN_SPRITE)
    }

    update() {
        if (this.fadeMode == "idle") return;
        const progress = Math.min((Date.now() - this.fadeStart) / this.fadeDuration, 1)

        const width = window.innerWidth;
        const height = window.innerHeight;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext('2d')!;

        ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeMode == "fadeOut" ? progress : 1 - progress})`;
        ctx.fillRect(0, 0, width, height);

        const texture = (this.DARKEN_SPRITE as any).material.map;
        texture.image = ctx.getImageData(0, 0, width, height);
        texture.needsUpdate = true;
    }

    public fadeIn(ms: number = 1000) {
        this.fadeMode = "fadeIn";
        this.fadeStart = Date.now();
        this.fadeDuration = ms;
    }

    public fadeOut(ms: number = 1000) {
        this.fadeMode = "fadeOut";
        this.fadeStart = Date.now();
        this.fadeDuration = ms;
    }
}
