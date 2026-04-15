import {UIInterface} from "./main";
import {FLAT} from "enable3d";
import {debug, Game, GameState} from "../util";

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
        if (Game.self?.isDead) return;
        if (Game.state == GameState.FLYING) {
            const boxWidth = this.hbWidth;
            const boxHeight = 50;
            const x = (this.hbWidth - boxWidth) / 2;
            const y = (this.hbHeight - boxHeight) / 2;

            // background
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.roundRect(x, y, boxWidth, boxHeight, 8);
            ctx.fill();

            // text
            const text = "Druk op E om te parachuteren";
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.font = "20px monospace";
            const textWidth = ctx.measureText(text).width;
            ctx.fillText(
                text,
                x + (boxWidth - textWidth) / 2,
                y + boxHeight / 2 + 7
            );

            return;
        }

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
        let active: boolean = Game.self!.activeItem.typeId == "gun";
        if (!Game.self!.gun.isReloading) this.renderInventorySlot(ctx, active, "1", 14, this.gunSource, Game.self!.gun.ammo.toString(), Game.self!.gun.fullAmmo.toString());
        else this.renderInventorySlot(ctx, active, "1", 14, this.gunSource, Game.self!.gun.ammo.toString(), Game.self!.gun.fullAmmo.toString(), "Reloading...");

        // water/teacannon
        active = Game.self!.activeItem.typeId == "watercannon";
        this.renderInventorySlot(ctx, active, "2", 12 + this.itemWidth + this.itemDistance, this.waterCannonSource, "100", "100", "2500 punten")

        // car bomb
        active = Game.self!.activeItem.typeId == "car_bomb";
        this.renderInventorySlot(ctx, active, "3", 12 + this.itemWidth * 2 + this.itemDistance * 2, this.carBombSource, "Autobom", "Area Damage", "5000 punten");
    }

    private renderInventorySlot(ctx: CanvasRenderingContext2D, active: boolean, number: string, x: number, icon: HTMLImageElement, bigText: string, smallText: string, overlay?: string) {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.strokeStyle = active ? "white" : "black";
        ctx.font = "12px monospace"
        ctx.fillText(number, x + 2, 30);

        ctx.beginPath();
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

        // center time
        const time = Game.formattedTimeRemaining();

        ctx.beginPath();
        ctx.font = "18px monospace";
        ctx.fillStyle = "white";

        const textWidth = ctx.measureText(time).width;
        ctx.fillText(
            time,
            this.pbWidth / 2 - textWidth / 2,
            this.pbHeight / 2 + 6
        );
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

    renderPointBar(
        ctx: CanvasRenderingContext2D,
        x: number,
        points: number,
        color: string,
        left: boolean
    ) {
        const offset = 8;
        const gapWidth = 90;

        const total = Game.nationalistPoints + Game.loyalistPoints;

        const fullWidth = this.pbWidth - offset * 2;
        const halfWidth = (fullWidth - gapWidth) / 2;

        const barHeight = this.pbHeight - offset * 2;

        const pointMultiplier = total === 0 ? 0 : points / total;

        // define fixed origin inside the bar
        const leftStart = offset;
        const rightStart = offset + halfWidth + gapWidth;

        const baseX = left ? leftStart : rightStart;
        const barWidth = halfWidth;

        // outline
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.roundRect(baseX, offset, barWidth, barHeight, 4);
        ctx.stroke();

        // fill
        const fillWidth = barWidth * pointMultiplier;

        ctx.beginPath();
        if (left) {
            ctx.roundRect(baseX, offset, fillWidth, barHeight, 4);
        } else {
            ctx.roundRect(baseX + (barWidth - fillWidth), offset, fillWidth, barHeight, 4);
        }
        ctx.fill();

        // text
        ctx.beginPath();
        ctx.font = "18px monospace";
        ctx.fillStyle = "white";

        const text = points.toString();
        const textX = left
            ? baseX + 6
            : baseX + barWidth - ctx.measureText(text).width - 6;

        ctx.fillText(text, textX, this.pbHeight / 2 + 6);
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
