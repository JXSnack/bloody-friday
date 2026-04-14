import {Group} from "three";
import {debug, Game, Vec} from "../util";
import {Player} from "../entity/player";
import {ExtendedGroup} from "enable3d";

export abstract class Item {
    public readonly typeId: string;

    public owner: Player;
    public model?: Group;
    public modelOffset: Vec = Vec.ZERO;

    private isLoadingModel: boolean = false;

    constructor(owner: Player, typeId: string) {
        this.owner = owner;
        this.typeId = typeId;
    }

    create() {
        debug(this.typeId + " item created")
    }

    update() {
        let pos = this.owner.getPos().addRotated(this.modelOffset, this.owner.getRot())
        this.model?.position.set(pos.x, pos.y, pos.z);

        let rot = this.owner.getRot();

        if (this.model != null) {
            this.model.rotation.x = rot.x;
            this.model.rotation.y = rot.y;
            this.model.rotation.z = rot.z;
        }
    }

    use() {}

    loadModel(path: string, then: () => void) {
        if (this.isLoadingModel) return;
        this.isLoadingModel = true;

        Game.getOrLoadModel(path).then((model) => {
            this.model = model;
            this.model.scale.set(1, 1, 1);
            this.model.position.set(this.modelOffset.x, this.modelOffset.y, this.modelOffset.z);
            Game.world!.add.existing(this.model);
            this.model.visible = false;
            then();
        }).catch((err) => {
            debug("FAILED to load item model check console");
            console.error("Failed to load item model:", err);
            this.isLoadingModel = false; // only reset on failure so it can retry
        });
    }

    createMesh() {}

    removeMesh() {
        this.owner.scene.destroy(this.model as ExtendedGroup);
        this.model?.remove();
    }
}
