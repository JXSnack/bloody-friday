import {UIInterface} from "./main";
import {FLAT} from "enable3d";
import {debug, Game} from "../util";

export class BarsOverlay extends UIInterface {
    private crosshair: FLAT.SimpleSprite | undefined;
    private healthBar?: FLAT.DrawSprite;
    private pointBar!: FLAT.DrawSprite;

    private readonly pbHeight: number = 48;
    private readonly pbWidth: number = 0.5 * window.innerWidth;
    private readonly hbWidth: number = 0.4 * window.innerWidth;
    private readonly hbHeight: number = 120;
    private readonly itemDistance = 8;
    private readonly itemWidth = (this.hbWidth - 24 - this.itemDistance * 2) / 3;
    private readonly itemHeight = this.hbHeight - 25 - 14 * 3;

    private readonly gunSource = new Image();
    private readonly waterCannonSource = new Image();
    private readonly carBombSource = new Image();

    private redrawSprite(sprite: FLAT.DrawSprite, width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext('2d')!;
        draw(ctx);

        const texture = (sprite as any).material.map;
        texture.image = ctx.getImageData(0, 0, width, height);
        texture.needsUpdate = true;
    }

    private drawHealthBar(ctx: CanvasRenderingContext2D) {
        // background
        ctx.beginPath();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.roundRect(0, 0, this.hbWidth, this.hbHeight, 10);
        ctx.fill();

        // health bar background
        ctx.beginPath();
        ctx.fillStyle = "#727272";
        ctx.roundRect(12, this.hbHeight - 25 - 14, this.hbWidth - 24, 25, 4);
        ctx.fill();

        // health bar
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.roundRect(12, this.hbHeight - 25 - 14, (Game.self!.health / Game.self!.maxHealth) * (this.hbWidth - 24), 25, 4);
        ctx.fill();

        // items

        // gun
        if (!Game.self!.gun.isReloading) this.renderInventorySlot(ctx, "1", 14, this.gunSource, Game.self!.gun.ammo.toString(), Game.self!.gun.fullAmmo.toString());
        else this.renderInventorySlot(ctx, "1", 14, this.gunSource, Game.self!.gun.ammo.toString(), Game.self!.gun.fullAmmo.toString(), "Reloading...");

        // water/teacannon
        this.renderInventorySlot(ctx, "2", 12 + this.itemWidth + this.itemDistance, this.waterCannonSource, "100", "100", "2500 punten")

        // car bomb
        this.renderInventorySlot(ctx, "3", 12 + this.itemWidth * 2 + this.itemDistance * 2, this.carBombSource, "Autobom", "Area Damage", "5000 punten");
    }

    private renderInventorySlot(ctx: CanvasRenderingContext2D, number: string, x: number, icon: HTMLImageElement, bigText: string, smallText: string, overlay?: string) {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "white";
        ctx.roundRect(x - 2, 14, this.itemWidth, this.itemHeight, 4)
        ctx.stroke()

        ctx.beginPath()
        ctx.drawImage(icon, x + 12, 14 + 2, this.itemHeight, this.itemHeight)

        ctx.beginPath();
        ctx.font = "24px monospace"
        let bigTextOffset = ctx.measureText(bigText).width;
        ctx.fillText(bigText, x - 14 + this.itemWidth - bigTextOffset, this.itemHeight - 12);

        ctx.beginPath();
        ctx.font = "16px monospace"
        ctx.fillStyle = "gray";
        let smallTextOffset = ctx.measureText(smallText).width;
        ctx.fillText(smallText, x - 14 + this.itemWidth - smallTextOffset, this.itemHeight + 5);

        if (overlay) {
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.roundRect(x - 2, 14, this.itemWidth, this.itemHeight, 4);
            ctx.fill();

            ctx.beginPath();
            ctx.font = "24px RobotoReg, monospace";
            ctx.fillStyle = "white";
            ctx.fillText(overlay, x - 14 + this.itemWidth / 2 - ctx.measureText(overlay).width / 2 + 12, 14 + (this.itemHeight - 14) - 7)
        }
    }

    private drawPointBar(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.roundRect(0, 0, this.pbWidth, this.pbHeight, 6);
        ctx.fill();

        this.renderPointBar(ctx, 0, Game.nationalistPoints, "rgb(255,12,12)", true);
        this.renderPointBar(ctx, this.pbWidth / 2, Game.loyalistPoints, "rgb(12, 12, 255)", false);
    }

    create() {
        if (Game.world == null) return;

        // load images
        Game.world.load.texture("/crosshair.png").then((tx) => {
            debug("crosshair ready");
            this.crosshair = new FLAT.SimpleSprite(tx);
            this.addSprite(this.crosshair);
        });

        this.gunSource.src = "/gun.png";
        this.waterCannonSource.src = "/water_cannon.png"
        this.carBombSource.src = "/car_bomb.png"

        // stuff
        let roboto = new FontFace("RobotoReg", "url(/Roboto-Regular.ttf)");
        document.fonts.add(roboto);
        roboto.load().then(() => {
            this.healthBar = new FLAT.DrawSprite(this.hbWidth, this.hbHeight, (ctx) => this.drawHealthBar(ctx));
            this.addSprite(this.healthBar);
        });

        this.pointBar = new FLAT.DrawSprite(this.pbWidth, this.pbHeight, (ctx) => this.drawPointBar(ctx));
        this.addSprite(this.pointBar);
    }

    renderPointBar(ctx: CanvasRenderingContext2D, x: number, points: number, color: string, left: boolean) {
        let offset = 8;
        let barWidth = this.pbWidth * 0.475;
        let pointMultiplier = points / (Game.nationalistPoints + Game.loyalistPoints);

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.roundRect(x + offset, offset, barWidth, this.pbHeight - offset * 2, 4);
        ctx.stroke();

        ctx.beginPath();
        if (left) {
            ctx.roundRect(x + offset, offset, barWidth * pointMultiplier, this.pbHeight - offset * 2, 4);
        } else {
            ctx.roundRect(x + barWidth - barWidth * pointMultiplier, offset, barWidth * pointMultiplier + offset, this.pbHeight - offset * 2, 4);
        }
        ctx.fill();

        ctx.beginPath();
        ctx.font = "18px monospace";
        ctx.fillStyle = "white";
        let textX = offset * 2;
        if (!left) textX = barWidth - ctx.measureText(points.toString()).width;
        ctx.fillText(points.toString(), x + textX, this.pbHeight / 2 + 6);
    }

    update() {
        if (this.crosshair != null) {
            this.crosshair.setPosition(window.innerWidth / 2, window.innerHeight / 2);
            this.crosshair.setScale(0.05);
        }

        this.pointBar.setPosition(window.innerWidth / 2, window.innerHeight - 32);
        this.redrawSprite(this.pointBar, this.pbWidth, this.pbHeight, (ctx) => this.drawPointBar(ctx));

        if (this.healthBar == null) return;
        this.healthBar.setPosition(window.innerWidth / 2, this.hbHeight / 2 + 20);
        this.redrawSprite(this.healthBar, this.hbWidth, this.hbHeight, (ctx) => this.drawHealthBar(ctx));
    }
}
