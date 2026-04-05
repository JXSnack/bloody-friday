import { Scene3D } from "enable3d";
import {Entity} from "../entity/entity";
import {Player} from "../entity/player"
import {Game} from "../util";
import {PerspectiveCamera} from "three";

export class MainScene extends Scene3D {
    private entities: Record<string, Entity> = {};

    constructor() {
        super({ key: "MainScene" } );
    }

    async create() {
        Game.world = this;

        await this.warpSpeed("-ground", "-orbitControls");

        this.physics.add.ground({mass: 0, width: 10, height: 10});

        Game.self = new Player(this);
        Game.self.uuid = Game.networking.clientId;
        this.addEntity(Game.self);

        this.camera.position.set(0, 10, 15);

        window.onresize = () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);

            const cam = this.camera as PerspectiveCamera;
            cam.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    update() {
        for (const [id, entity] of Object.entries(this.entities)) {
            entity.update();
        }

        // @ts-ignore
        this.camera.lookAt(Game.self.getPos().x, Game.self.getPos().y, Game.self.getPos().z);
    }

    addEntity(entity: Entity) {
        this.entities[entity.uuid] = entity;
        entity.create();
        entity.initMeshStuff();
    }

    getEntity(uuid: string): Entity | null {
        return this.entities[uuid];
    }

    removeEntity(uuid: string) {
        let entity = this.getEntity(uuid);
        if (entity == null) return;

        entity.remove();
        delete this.entities[uuid];
    }
}
