import {NetworkingData} from "./networking/main";
import {Player} from "./entity/player";
import {Vector3} from "three";

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
}

export type Box = {width: number, height: number, depth: number}

class GameInstance {
    public keys: Record<string, boolean> = {};
    public networking: NetworkingData = new NetworkingData();

    public self: Player | null = null;

    doUpdate() {
        if (this.self == null) return;
        this.self.broadcast();
    }
}

export const Game: GameInstance = new GameInstance();
