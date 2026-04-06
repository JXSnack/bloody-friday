import {UIInterface} from "./main";
import {FLAT} from "enable3d";
import {debug, Game} from "../util";

export class BarsOverlay extends UIInterface {
    private crosshair: FLAT.SimpleSprite | undefined;
    private healthBar?: FLAT.DrawSprite;
    private pointBar!: FLAT.DrawSprite;

    private readonly pbHeight: number = 48;
    private readonly pbWidth: number = 0.5 * window.innerWidth;

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

        this.pointBar = new FLAT.DrawSprite(this.pbWidth, this.pbHeight, (ctx) => {
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.roundRect(0, 0, this.pbWidth, this.pbHeight, 6);
            ctx.fill();

            this.renderPointBar(ctx, 0, Game.nationalistPoints, "rgb(255,12,12)", true)
            this.renderPointBar(ctx, this.pbWidth - (this.pbWidth / 2), Game.loyalistPoints, "rgb(12, 12, 255)", false)
        });
        this.addSprite(this.pointBar);
    }

    renderPointBar(ctx: CanvasRenderingContext2D, x: number, points: number, color: string, left: boolean) {
        let offset = 8;
        let barWidth = this.pbWidth * 0.475;

        let pointMultiplier = points / (Game.nationalistPoints + Game.loyalistPoints)

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.roundRect(x + offset, offset, barWidth, this.pbHeight - offset * 2, 4);
        ctx.stroke();

        ctx.beginPath()
        if (left) {
            ctx.roundRect(x + offset, offset, barWidth * pointMultiplier, this.pbHeight - offset * 2, 4);
        } else {
            ctx.roundRect(x + barWidth - barWidth * pointMultiplier, offset, barWidth * pointMultiplier + offset, this.pbHeight - offset * 2, 4)
        }
        ctx.fill()

        ctx.beginPath();
        ctx.font = "18px monospace"
        ctx.fillStyle = "white";

        let textX = offset * 2;
        if (!left) textX = barWidth - textX * 2;

        ctx.fillText(points.toString(), x + textX, this.pbHeight / 2 + 6)
    }

    update() {
        if (this.crosshair != null) {
            this.crosshair.setPosition(window.innerWidth / 2, window.innerHeight / 2)
            this.crosshair.setScale(0.05)
        }

        this.pointBar.setPosition(window.innerWidth / 2, window.innerHeight - 32)

        if (this.healthBar == null) return;
        this.healthBar.setPosition(window.innerWidth / 2, this.healthBar.textureHeight / 2 + 20);
    }
}
