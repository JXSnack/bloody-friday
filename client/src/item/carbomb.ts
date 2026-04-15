import {Item} from "./main";
import {Player} from "../entity/player";
import {debug, Game, Vec} from "../util";

export class CarBomb extends Item {
    constructor(owner: Player) {
        super(owner, "car_bomb");
        this.modelOffset = new Vec(-0.23, -0.3, 0);
    }

    create() {
        super.create();

        if (Game.self == this.owner) this.modelOffset = this.modelOffset.withAdd(new Vec(0.04, 0.65, 0))
    }

    createMesh() {
        this.loadModel("/carbomb.glb", () => {
            this.model!.scale.set(0.4, 0.4, 0.4);
        })
    }

    use() {
        import("../entity/carbomb").then((cb) => {
            let entity = new cb.CarBombEntity(this.owner);
            Game.world?.addEntity(entity);
        })
    }
}
