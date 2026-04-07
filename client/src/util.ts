import {NetworkingData} from "./networking/main";
import {Player} from "./entity/player";
import {Group, Vector3} from "three";
import {MainScene} from "./scene/world";
import {FLAT} from "enable3d";
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Entity} from "./entity/entity";
import {AudioManager} from "@yandeu/audio";
import {Sounds} from "./sound";

export enum Team {
    NATIONALIST,
    LOYALIST
}

export class Vec {
    constructor(public x: number, public y: number, public z: number) {}

    withAdd(other: Vec): Vec {
        return new Vec(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    withSub(other: Vec): Vec {
        return new Vec(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    withMul(other: Vec): Vec {
        return new Vec(this.x * other.x, this.y * other.y, this.z * other.z);
    }

    withDiv(other: Vec): Vec {
        return new Vec(this.x / other.x, this.y / other.y, this.z / other.z);
    }

    rotateAround(pivot: Vec, rotation: Vec): Vec {
        // Translate to origin
        let x = this.x - pivot.x;
        let y = this.y - pivot.y;
        let z = this.z - pivot.z;

        // Rotate X axis
        const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;

        // Rotate Y axis
        const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);
        const x2 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;

        // Rotate Z axis
        const cosZ = Math.cos(rotation.z), sinZ = Math.sin(rotation.z);
        const x3 = x2 * cosZ - y1 * sinZ;
        const y3 = x2 * sinZ + y1 * cosZ;

        return new Vec(x3 + pivot.x, y3 + pivot.y, z2 + pivot.z);
    }

    addRotated(offset: Vec, rotation: Vec): Vec {
        return offset.rotateAround(Vec.ZERO, rotation).withAdd(this);
    }

    subRotated(offset: Vec, rotation: Vec): Vec {
        return this.withSub(offset.rotateAround(Vec.ZERO, rotation));
    }

    mulRotated(offset: Vec, rotation: Vec): Vec {
        return offset.rotateAround(Vec.ZERO, rotation).withMul(this);
    }

    divRotated(offset: Vec, rotation: Vec): Vec {
        return this.withDiv(offset.rotateAround(Vec.ZERO, rotation));
    }

    static ZERO = new Vec(0, 0, 0);
    static from = (vector: Vector3): Vec => {
        return new Vec(vector.x, vector.y, vector.z);
    }

    to3(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }
}

export type Box = {width: number, height: number, depth: number}

class GameInstance {
    public keys: Record<string, boolean> = {};
    public networking: NetworkingData = new NetworkingData();

    public self: Player | null = null;
    public world: MainScene | null = null;
    public hud: FLAT.FlatArea | null = null;
    public audio: AudioManager = new AudioManager();
    public sounds: Sounds = new Sounds();

    public loyalistPoints: number = 0;
    public nationalistPoints: number = 0;
    public team?: Team;

    doUpdate() {
        if (this.self == null) return;
        this.self.broadcast();
        this.world?.checkEntityLifetimes();
    }

    private modelCachePromises: Record<string, Promise<GLTF>> = {};

    async getOrLoadModel(path: string): Promise<Group> {
        if (!this.modelCachePromises[path]) {
            this.modelCachePromises[path] = new Promise((resolve, reject) => {
                new GLTFLoader().load(path, resolve, undefined, reject);
            });
        }

        const gltf = await this.modelCachePromises[path];
        return gltf.scene.clone();
    }
}

export const Game: GameInstance = new GameInstance();

export const debugOutput: any = []
export function debug(...data: any) {
    console.log(data);
    debugOutput.push(data);
}
