import {UIInterface} from "./main";
import {FLAT} from "enable3d";
import {debug, Game} from "../util";

export class BarsOverlay extends UIInterface {
    private crosshair: FLAT.SimpleSprite | undefined;
    private healthBar!: FLAT.DrawSprite;

    create() {
        if (Game.world == null) return;

        Game.world.load.texture("/crosshair.png").then((tx) => {
            debug("crosshair ready")
            this.crosshair = new FLAT.SimpleSprite(tx);
            this.addSprite(this.crosshair);
        });

        let roboto = new FontFace("RobotoReg", "url(/Roboto-Regular.ttf)");
        document.fonts.add(roboto);
        roboto.load().then(() => {
            let width = 0.4 * window.innerWidth;
            let height = 120;

            this.healthBar = new FLAT.DrawSprite(width, height, (ctx) => {
                ctx.beginPath()
                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                ctx.roundRect(0, 0, width, height, 10);
                ctx.fill();

                ctx.beginPath()
                ctx.fillStyle = "#727272";
                ctx.roundRect(12, height - 25 - 14, width - 24, 25, 4);
                ctx.fill()

                ctx.beginPath();
                ctx.fillStyle = "white";
                ctx.roundRect(12, height - 25 - 14, (16 / Game.self!.maxHealth) * (width - 24), 25, 4)
                ctx.fill();
            });
            this.addSprite(this.healthBar);
        })

    }

    update() {
        if (this.crosshair != null) {
            this.crosshair.setPosition(window.innerWidth / 2, window.innerHeight / 2)
            this.crosshair.setScale(0.05)
        }

        if (this.healthBar == null) return;
        this.healthBar.setPosition(window.innerWidth / 2, this.healthBar.textureHeight / 2 + 20);
    }
}
