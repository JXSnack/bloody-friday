import {FirstPersonControls, Scene3D} from "enable3d";
import {Entity} from "../entity/entity";
import {Player} from "../entity/player"
import {Game} from "../util";
import {PerspectiveCamera} from "three";

export class MainScene extends Scene3D {
    private entities: Record<string, Entity> = {};
    private controls!: FirstPersonControls;

    private mouseX: number = 0;
    private mouseY: number = 0;

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


        this.controls = new FirstPersonControls(this.camera, Game.self.mesh, {
            pointerLock: true
        });

        document.addEventListener("click", () => {
            document.body.requestPointerLock();
        });

        // Feed mouse deltas to controls
        document.addEventListener("mousemove", (e) => {
            if (document.pointerLockElement !== document.body) return;
            this.mouseX = e.movementX;
            this.mouseY = e.movementY;
        });

        window.onresize = () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);

            const cam = this.camera as PerspectiveCamera;
            cam.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    update() {
        // mouse deltas
        this.controls?.update(this.mouseX, this.mouseY);
        this.mouseX = 0;
        this.mouseY = 0;

        for (const [, entity] of Object.entries(this.entities)) {
            entity.update();
        }

        // apply eye height AFTER controls update, AFTER entity update
        if (Game.self?.mesh) {
            const pos = Game.self.getPos();
            Game.world!.camera.position.set(pos.x, pos.y + 1, pos.z);
        }
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

        entity.removeMesh();
        delete this.entities[uuid];
    }
}
