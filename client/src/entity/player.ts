import {Entity} from "./entity";
import {Scene3D} from "enable3d";
import {Game, Vec} from "../util";

export class Player extends Entity {
    constructor(scene: Scene3D) {
        super("player", scene);
    }

    create() {
        this.mesh = this.scene.physics.add.box(
            {...new Vec(0, 2, 0), ...this.hitboxSize, mass: this.mass},
            {phong: {color: 0xffffff}}
        );
    }

    update() {
        if (this.mesh == null) return;
        if (Game.self === this) this.handlePlayerControls();

        super.update();
    }

    private handlePlayerControls() {
        const maxSpeed = 5;
        const accel = 0.2;     // how fast you speed up
        const friction = 0.15; // how fast you slow down

        let inputX = 0;
        let inputZ = 0;

        if (Game.keys["KeyA"]) inputX -= 1;
        if (Game.keys["KeyD"]) inputX += 1;
        if (Game.keys["KeyW"]) inputZ -= 1;
        if (Game.keys["KeyS"]) inputZ += 1;

        // normalize input
        const len = Math.hypot(inputX, inputZ);
        if (len > 0) {
            inputX /= len;
            inputZ /= len;
        }

        const targetVX = inputX * maxSpeed;
        const targetVZ = inputZ * maxSpeed;

        const current = this.mesh.body.velocity;

        // interpolate toward target velocity
        const vx = current.x + (targetVX - current.x) * accel;
        const vz = current.z + (targetVZ - current.z) * accel;

        // apply friction when no input
        const finalVX = len === 0 ? current.x * (1 - friction) : vx;
        const finalVZ = len === 0 ? current.z * (1 - friction) : vz;

        this.vel = new Vec(finalVX, 0, finalVZ);

        // jump
        if (Game.keys["Space"] && this.isColliding()) {
            this.mesh.body.setVelocityY(6);
        }
    }
}
