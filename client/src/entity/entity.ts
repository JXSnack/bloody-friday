import {Box, Game, Vec} from "../util";
import {ExtendedMesh, Scene3D} from "enable3d";

export abstract class Entity {
    public readonly typeId: string;
    public uuid = crypto.randomUUID();

    private readonly LERP_FACTOR = 0.2; // tune this (0.1 = smooth, 0.3 = snappier)

    constructor(typeId: string, scene: Scene3D) {
        this.typeId = typeId;
        this.scene = scene;
    }

    public scene: Scene3D;
    public collisions: number = 0;

    public targetPos: Vec | null = null;
    public vel: Vec = Vec.ZERO;
    public hitboxSize: Box = {width: 1, height: 1, depth: 1};
    public mass: number = 1;

    public mesh!: ExtendedMesh;

    create() {}
    initMeshStuff() {
        this.mesh.body.on.collision((other, event) => {
            if (event == "start") this.collisions++;
            else if (event == "end") this.collisions--;
        })
    }

    update() {
        if (this.mesh == null) return;

        if (this.targetPos != null) {
            const cur = this.getPos();
            const lerped = new Vec(
                cur.x + (this.targetPos.x - cur.x) * this.LERP_FACTOR,
                cur.y + (this.targetPos.y - cur.y) * this.LERP_FACTOR,
                cur.z + (this.targetPos.z - cur.z) * this.LERP_FACTOR,
            );
            this.setPos(lerped);
            return; // skip local physics for remote entities
        }

        // existing local physics...
        const vy = this.mesh.body.velocity.y;
        this.mesh.body.setVelocity(this.vel.x, vy + this.vel.y, this.vel.z);
        this.vel = Vec.ZERO;
    }

    setPos(pos: Vec) {
        if (this.mesh == null) return;
        this.mesh.position.set(pos.x, pos.y, pos.z);
        this.mesh.body.needUpdate = true;
    }

    getPos(): Vec {
        if (this.mesh == null) return Vec.ZERO;
        return new Vec(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
    }

    isColliding(): boolean {
        return this.collisions > 0;
    }

    broadcast() {
        if (Game.self == null) return;
        if (this.mesh == null) return;

        Game.networking.send(this.uuid, {"type": "update", "pos": JSON.stringify(this.getPos())});
    }

    remove() {
        Game.world?.physics.destroy(this.mesh);
        Game.world?.destroy(this.mesh);
        this.mesh.remove();
    }
}
