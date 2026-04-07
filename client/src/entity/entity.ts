import {Box, debug, Game, Vec} from "../util";
import {ExtendedGroup, ExtendedMesh, Scene3D} from "enable3d";
import {Group} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

export abstract class Entity {
    public readonly typeId: string;
    public uuid = crypto.randomUUID();
    public lastPing: number = Date.now();

    private readonly LERP_FACTOR = 0.2; // tune this (0.1 = smooth, 0.3 = snappier)

    constructor(typeId: string, scene: Scene3D) {
        this.typeId = typeId;
        this.scene = scene;
    }

    public scene: Scene3D;
    public collisions: number = 0;
    public remote: boolean = false;

    private targetPos: Vec | null = null;
    public vel: Vec = Vec.ZERO;
    public hitboxSize: Vec = new Vec(1, 1, 1);
    public mass: number = 1;

    public mesh!: ExtendedMesh;
    public model?: Group;
    public modelOffset: Vec = Vec.ZERO;
    isLoadingModel: boolean = false;

    loadModel(path: string, then: () => void) {
        if (this.isLoadingModel) return;
        this.isLoadingModel = true;

        Game.getOrLoadModel(path).then((model) => {
            this.model = model;
            this.model.scale.set(1, 1, 1);
            this.model.position.set(this.modelOffset.x, this.modelOffset.y, this.modelOffset.z);
            this.scene.add.existing(this.model);
            debug("applied model to " + this.uuid);
            then();
        }).catch((err) => {
            debug("FAILED to load model check console");
            console.error("Failed to load model:", err);
            this.isLoadingModel = false; // only reset on failure so it can retry
        });
    }

    create() {}

    initMeshStuff() {
        // @ts-ignore
        this.mesh.bloodyFridayEntity = this;
        this.mesh.body.on.collision((other: any, event) => {
            if (event == "start") {
                this.collisions++;

                if (other == null) return;
                if (!other.bloodyFridayEntity) return;
                this.onCollide(other.bloodyFridayEntity);
            }
            else if (event == "end") this.collisions--;
        })
    }

    update() {
        if (this.mesh == null) return;
        let pos = this.getPos();

        if (this.remote && this.targetPos != null) this.updateLerpedRemotePos();
        else if (!this.remote) {
            const vy = this.mesh.body.velocity.y;
            this.mesh.body.setVelocity(this.vel.x, vy + this.vel.y, this.vel.z);
            this.vel = Vec.ZERO;
        }

        if (!this.remote && this.getPos().y < -1) {
            this.vel = this.vel.withAdd(new Vec(0, 2, 0))
        }

        if (this.model != null) {
            let modelPos = pos.withAdd(this.modelOffset);
            this.model.position.set(modelPos.x, modelPos.y, modelPos.z);
        }
    }

    onCollide(other: Entity) {}

    private updateLerpedRemotePos() {
        if (this.targetPos == null) return;

        const cur = this.getPos();
        const lerped = new Vec(
            cur.x + (this.targetPos.x - cur.x) * this.LERP_FACTOR,
            cur.y + (this.targetPos.y - cur.y) * this.LERP_FACTOR,
            cur.z + (this.targetPos.z - cur.z) * this.LERP_FACTOR,
        );

        this.mesh.position.set(lerped.x, lerped.y, lerped.z);
        this.mesh.body.needUpdate = true;
    }

    setPos(pos: Vec) {
        if (this.mesh == null) return;

        if (this.remote) this.targetPos = pos;
        else {
            this.mesh.position.set(pos.x, pos.y, pos.z);
            this.mesh.body.needUpdate = true;
        }
    }

    getPos(): Vec {
        if (this.mesh == null) return Vec.ZERO;
        return Vec.from(this.mesh.position);
    }

    isColliding(): boolean {
        return this.collisions > 0;
    }

    broadcast() {
        if (Game.self == null) return;
        if (this.mesh == null) return;

        Game.networking.send(this.uuid, this.makePacket());
    }

    makePacket(): any {
        return {"type": "update", "pos": this.getPos()}
    }

    removeMesh() {
        Game.world?.physics.destroy(this.mesh);
        Game.world?.destroy(this.mesh);

        if (this.model != null) {
            this.scene.destroy(this.model as ExtendedGroup);
            this.model.remove();
        }

        this.mesh.remove();
    }
}
