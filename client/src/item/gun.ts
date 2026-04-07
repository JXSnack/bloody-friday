import {Item} from "./main";
import {Player} from "../entity/player";
import {Game, Vec} from "../util";

export class Gun extends Item {
    constructor(owner: Player) {
        super(owner, "gun");
        this.modelOffset = new Vec(-0.23, 0.1, 0);
    }

    create() {
        super.create();

        if (this.owner == Game.self) this.modelOffset = this.modelOffset.withAdd(new Vec(0.15, 0.2, 0))

        this.loadModel("/gun.glb", () => {
            this.model?.scale.set(0.2, 0.2, 0.2);
        })
    }
}
