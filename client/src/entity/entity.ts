import {Box, Game, Vec} from "../util";
import {ExtendedMesh, Scene3D} from "enable3d";

export abstract class Entity {
    public readonly typeId: string;
    public readonly uuid = crypto.randomUUID();

    constructor(typeId: string, scene: Scene3D) {
        this.typeId = typeId;
        this.scene = scene;
    }

    public scene: Scene3D;
    public collisions: number = 0;

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
        const vy = this.mesh.body.velocity.y; // gravity

        this.mesh.body.setVelocity(
            this.vel.x,
            vy + this.vel.y,
            this.vel.z
        );

        this.vel = Vec.ZERO;
    }

    setPos(pos: Vec) {
        if (this.mesh == null) return;
        this.mesh.body.setPosition(pos.x, pos.y, pos.z);
    }

    getPos(): Vec {
        if (this.mesh == null) return Vec.ZERO;
        return new Vec(this.mesh.body.position.x, this.mesh.body.position.y, this.mesh.body.position.z);
    }

    isColliding(): boolean {
        return this.collisions > 0;
    }
}
