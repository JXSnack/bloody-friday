import {NetworkingData} from "./networking/main";
import {Player} from "./entity/player";
import {Group, Vector3} from "three";
import {MainScene} from "./scene/world";
import {FLAT} from "enable3d";
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Entity} from "./entity/entity";

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
