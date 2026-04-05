import { Scene3D } from "enable3d";
import {Entity} from "../entity/entity";
import {Player} from "../entity/player"

export class MainScene extends Scene3D {
    private entities: Entity[] = [];

    constructor() {
        super({ key: "MainScene" } );
    }

    async create() {
        await this.warpSpeed("-ground", "-orbitControls");

        this.addEntity(new Player(this));

        this.camera.position.set(0, 10, 15);
        this.camera.lookAt(0, 0, 0);
    }

    update() {
        for (let entity of this.entities) {
            entity.update();
        }
    }

    addEntity(entity: Entity) {
        this.entities.push(entity);
        entity.create();
    }
}
