import {Entity} from "./entity";
import {Game, Vec} from "../util";
import {Scene3D} from "enable3d";

export class Explosion extends Entity {
    private creationTime: number = Date.now();
    private destroyTime: number = 3 * 1000;

    constructor(pos: Vec, scene: Scene3D) {
        super("explosion", scene);
        this.targetPos = pos;
    }

    create() {
        this.createMesh();
    }

    createMesh() {
        this.mesh = this.scene.add.box({...this.targetPos}, {phong: {color: 0xffffff}});
        this.mesh.visible = false;

        this.loadModel("/explosion.glb", () => {
            this.model!.scale.set(5, 5, 5);
        });
    }

    update() {
        super.update();

        if (this.creationTime + this.destroyTime < Date.now()) {
            Game.world!.removeEntity(this.uuid);
        }
    }
}
