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

export enum GameState {
    AWAITING_MONITOR, // before the game has started
    PREPARING, // preparing loyalist dropoff
    FLYING, // flying with plane (loyalist-only)
    FIGHTING, // fighting
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

    withNormalized(): Vec {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (length === 0) return new Vec(0, 0, 0);
        return new Vec(this.x / length, this.y / length, this.z / length);
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
    static from = (vector: { x: number, y: number, z: number }): Vec => {
        return new Vec(vector.x, vector.y, vector.z);
    }

    to3(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }
}

export type Box = { width: number, height: number, depth: number }

class GameInstance {
    public keys: Record<string, boolean> = {};
    public networking: NetworkingData = new NetworkingData();

    public started: boolean = false;
    public timeSinceStarted: number = Date.now();
    public state: GameState = GameState.AWAITING_MONITOR;

    public self: Player | null = null;
    public world: MainScene | null = null;
    public hud: FLAT.FlatArea | null = null;
    public audio: AudioManager = new AudioManager();
    public sounds: Sounds = new Sounds();

    public playerName!: string;
    public loyalistPoints: number = 0;
    public nationalistPoints: number = 0;
    public team?: Team;

    doUpdate() {
        if (this.self == null) return;
        this.self.broadcast();

        if (this.world) {
            this.world?.checkEntityLifetimes();

            for (let entity of Object.values(this.world["entities"])) {
                if (!entity.remote) {
                    if (entity == this.self) continue;

                    entity.broadcast()
                }
            }
        }
    }

    private modelCachePromises: Record<string, Promise<GLTF>> = {};
    private gltfLoader: GLTFLoader = new GLTFLoader();

    async getOrLoadModel(path: string): Promise<Group> {
        if (!this.modelCachePromises[path]) {
            debug("loading new model " + path);
            this.modelCachePromises[path] = new Promise((resolve, reject) => {
                this.gltfLoader.load(path, resolve, undefined, reject);
            });
        }

        const gltf = await this.modelCachePromises[path];
        return gltf.scene.clone();
    }

    async preloadModels() {
        console.log("Preloading models...")
        await Promise.all([
            this.getOrLoadModel("/arena.glb"),
            this.getOrLoadModel("/arena_collisions.glb"),
            this.getOrLoadModel("/airplane.glb"),
            this.getOrLoadModel("/nationalist.glb"),
            this.getOrLoadModel("/loyalist.glb"),

            this.getOrLoadModel("/carbomb.glb"),
            this.getOrLoadModel("/gun.glb"),
            this.getOrLoadModel("/cannon.glb")
        ]);
    }

    formattedTimeRemaining(): string {
        const elapsed = Date.now() - this.timeSinceStarted;
        const remaining = Math.max(0, (Game.state == GameState.PREPARING ? (30 * 1000) : (8 * 60 * 1000)) - elapsed);

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        return String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0");
    }
}

export const Game: GameInstance = new GameInstance();

export const debugOutput: any = []

export function debug(...data: any) {
    console.log(data);
    debugOutput.push(data);
}

export function tryRequestFullscreen() {
    try {
        document.body.requestPointerLock().catch(() => {
        });
    } catch (ignore) {
    }
    // try {
    //     document.body.requestFullscreen().catch(() => {});
    // } catch (ignore) {}
}
