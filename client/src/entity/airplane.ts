import {Entity} from "./entity";
import {debug, Game, Team, Vec} from "../util";
import {Euler, MathUtils} from "three";

export class Airplane extends Entity {
    private spawnDate!: number;

    constructor() {
        super("airplane", Game.world!);
        this.targetPos = new Vec(0, 5, 0);
        this.modelOffset = new Vec(0, 2, 0);
    }

    create() {
        this.spawnDate = Date.now();
        this.createMesh();
    }

    createMesh() {
        this.mesh = this.scene.physics.add.box({...this.targetPos}, {phong: {color: 0xffffff}})
        this.mesh.visible = false;

        this.mesh.body.setCollisionFlags(2)
        this.mesh.body.setVelocity(0, 0, 0);
        this.mesh.body.setAngularVelocity(0, 0, 0);

        this.loadModel("/airplane.glb", () => {
            debug("airplane should be loaded")
            this.model!.scale.set(2, 2, 2)
        })
    }

    update() {
        super.update();

        let pos = new Vec(MathUtils.lerp(-40, 50, (Date.now() - this.spawnDate) / (10 * 1000)), 9, 0);
        this.setPos(pos)

        if (Game.team == Team.LOYALIST && Date.now() - this.spawnDate > 10 * 1000) {
            Game.world!.addEntity(Game.self!);
            Game.world!.removeEntity(this.uuid);
            Game.world!.setupControls();
        }

        if (Game.team == Team.LOYALIST) {
            const orbitRadius = 15;
            const orbitSpeed = 0.0004; // radians per ms, tune to taste
            const orbitHeight = 8;

            const angle = Date.now() * orbitSpeed;
            const camX = pos.x + Math.sin(angle) * orbitRadius;
            const camZ = pos.z + Math.cos(angle) * orbitRadius;
            const camY = pos.y + orbitHeight;

            Game.world!.camera.position.set(camX, camY, camZ);
            Game.world!.camera.lookAt(pos.x, pos.y, pos.z);
        }
    }

    broadcast() {} // Don't broadcast!
}
