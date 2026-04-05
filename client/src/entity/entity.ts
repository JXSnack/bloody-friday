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

    public pos: Vec = Vec.ZERO;
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
        this.vel = this.vel.withMul(Game.frictionMultiplier)
        this.pos = this.pos.withAdd(this.vel)
    }

    isColliding(): boolean {
        return this.collisions > 0;
    }
}
