import {NetworkingData} from "./networking/main";

export type Vec = {x: number, y: number, z: number};
export type Box = {width: number, height: number, depth: number}

export const VEC_ZERO: Vec = {x: 0, y: 0, z: 0}

class GameInstance {
    public keys: Record<string, boolean> = {};
    public networking: NetworkingData = new NetworkingData();
}

export const Game: GameInstance = new GameInstance();
