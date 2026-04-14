import {Entity} from "./entity";
import {debug, Game, Vec} from "../util";
import {MathUtils} from "three";

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

        this.setPos(new Vec(MathUtils.lerp(-40, 50, (Date.now() - this.spawnDate) / (10 * 1000)), 9, 0))

        if (Date.now() - this.spawnDate > 10 * 1000) {
            Game.world!.removeEntity(this.uuid);
        }
    }

    broadcast() {} // Don't broadcast!
}
