import {UIInterface} from "./main";
import {FLAT} from "enable3d";
import {Game} from "../util";

export class DeathOverlay extends UIInterface {
    private dimSprite?: FLAT.DrawSprite;
    private sprite?: FLAT.DrawSprite;

    private readonly width = 500;
    private readonly height = 220;

    create() {}

    update() {
        if (Game.keys["Enter"]) {
            Game.self!.respawn();
            return;
        }

        const dead = Game.self?.isDead ?? false;

        if (dead && !this.sprite) {
            this.sprite = new FLAT.DrawSprite(this.width, this.height, () => {});
            this.addSprite(this.sprite);

            this.dimSprite = new FLAT.DrawSprite(window.innerWidth, window.innerHeight, () => {});
            this.addSprite(this.dimSprite);
        }

        if (!dead && this.sprite) {
            this.removeSprite(this.dimSprite!);
            this.removeSprite(this.sprite);
            this.dimSprite = undefined;
            this.sprite = undefined;
        }

        if (!this.sprite || !dead) return;

        this.dimSprite!.setPosition(window.innerWidth / 2, window.innerHeight / 2);
        this.sprite.setPosition(window.innerWidth / 2, window.innerHeight / 2);

        this.redrawDim();
        this.redraw();
    }

    private redrawDim() {
        if (!this.dimSprite) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;

        // radial gradient: transparent center → heavy dark edges
        const gradient = ctx.createRadialGradient(w / 2, h / 2, h * 0.1, w / 2, h / 2, h * 0.85);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0.45)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.88)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        const texture = (this.dimSprite as any).material.map;
        texture.image = ctx.getImageData(0, 0, w, h);
        texture.needsUpdate = true;
    }

    private redraw() {
        if (!this.sprite) return;

        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext("2d")!;

        // dark background panel
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.roundRect(0, 0, this.width, this.height, 12);
        ctx.fill();

        // red top accent bar
        ctx.fillStyle = "rgba(200, 20, 20, 0.9)";
        ctx.roundRect(0, 0, this.width, 6, [12, 12, 0, 0]);
        ctx.fill();

        // "YOU DIED" heading
        ctx.font = "bold 52px RobotoReg, monospace";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("YOU DIED", this.width / 2, 80);

        // divider
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 100);
        ctx.lineTo(this.width - 40, 100);
        ctx.stroke();

        // respawn hint — pulsing opacity using sine wave on timestamp
        const pulse = 0.55 + 0.45 * Math.sin(Date.now() / 400);
        ctx.font = "20px RobotoReg, monospace";
        ctx.fillStyle = `rgba(200, 200, 200, ${pulse})`;
        ctx.fillText("Druk  ENTER  om te respawnen", this.width / 2, 150);

        const texture = (this.sprite as any).material.map;
        texture.image = ctx.getImageData(0, 0, this.width, this.height);
        texture.needsUpdate = true;
    }
}
