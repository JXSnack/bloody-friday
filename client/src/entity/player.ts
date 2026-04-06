import {Entity} from "./entity";
import {FirstPersonControls, Scene3D} from "enable3d";
import {debug, Game, Vec} from "../util";
import {Vector3} from "three";

export class Player extends Entity {
    public health: number = 20;
    public maxHealth: number = 20;
    public isDead: boolean = false;

    constructor(scene: Scene3D) {
        super("player", scene);
        this.mass = 2;
        this.hitboxSize = new Vec(0.7, 2, 0.7);
        this.modelOffset = this.modelOffset.withAdd(new Vec(0, -1, 0))
    }

    create() {
        this.mesh = this.scene.physics.add.box(
            {...new Vec(0, 1, 0), width: this.hitboxSize.x, height: this.hitboxSize.y, depth: this.hitboxSize.z, mass: this.mass},
            {phong: {color: 0xffffff}}
        );

        this.mesh.body.setAngularFactor(0, 0, 0);

        // lock camera to player
        this.mesh.visible = false;

        this.loadModel("/player.glb", () => {
            this.model!.scale.set(0.5, 0.5, 0.5);
            if (Game.self == this) {
                this.model!.visible = false;
            }
        });
    }

    update() {
        if (this.mesh == null) return;
        if (Game.self === this) this.handlePlayerControls();
        if (!this.remote) {
            if (!this.isDead) {
                if (this.health <= 0) {
                    this.health = this.maxHealth;
                    this.isDead = true;
                    this.setPos(new Vec(0, 2, 0));
                }
            }
        }

        super.update();
    }

    private handlePlayerControls() {
        const maxSpeed = 5;
        const accel = 0.2;
        const friction = 0.15;

        // same pattern as the official example
        const direction = new Vector3();
        Game.world!.camera.getWorldDirection(direction);
        const theta = Math.atan2(direction.x, direction.z);

        let moveX = 0;
        let moveZ = 0;

        if (Game.keys["KeyW"]) {
            moveX += Math.sin(theta) * maxSpeed;
            moveZ += Math.cos(theta) * maxSpeed;
        }
        if (Game.keys["KeyS"]) {
            moveX -= Math.sin(theta) * maxSpeed;
            moveZ -= Math.cos(theta) * maxSpeed;
        }
        if (Game.keys["KeyA"]) {
            moveX += Math.sin(theta + Math.PI * 0.5) * maxSpeed;
            moveZ += Math.cos(theta + Math.PI * 0.5) * maxSpeed;
        }
        if (Game.keys["KeyD"]) {
            moveX += Math.sin(theta - Math.PI * 0.5) * maxSpeed;
            moveZ += Math.cos(theta - Math.PI * 0.5) * maxSpeed;
        }

        const hasInput = moveX !== 0 || moveZ !== 0;
        const current = this.mesh.body.velocity;

        const finalVX = hasInput
            ? current.x + (moveX - current.x) * accel
            : current.x * (1 - friction);
        const finalVZ = hasInput
            ? current.z + (moveZ - current.z) * accel
            : current.z * (1 - friction);

        this.vel = new Vec(finalVX, this.vel.y, finalVZ);

        if (Game.keys["Space"] && this.isColliding()) {
            this.mesh.body.setVelocityY(6 * (1 / this.mass));
        }
    }
}
