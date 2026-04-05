import {Box, Vec, VEC_ZERO} from "../util";
import {ExtendedMesh, Scene3D} from "enable3d";

export abstract class Entity {
    public readonly typeId: string;
    public readonly uuid = crypto.randomUUID();

    constructor(typeId: string, scene: Scene3D) {
        this.typeId = typeId;
        this.scene = scene;
    }

    public scene: Scene3D;

    public pos: Vec = VEC_ZERO;
    public vel: Vec = VEC_ZERO;
    public hitboxSize: Box = {width: 1, height: 1, depth: 1};
    public mass: number = 1;

    public mesh!: ExtendedMesh;

    create() {}
    update() {}
}
