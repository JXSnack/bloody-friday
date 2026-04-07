import {Item} from "./main";
import {Player} from "../entity/player";
import {debug, Game, Vec} from "../util";
import {Raycaster, Vector3} from "three";
import {HitConfirmOverlay} from "../hud/hitConfirm";

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

    use() {
        const origin = Game.self!.getPos().withAdd(new Vec(0, 0.5, 0));

        const direction = new Vector3();
        Game.world!.camera.getWorldDirection(direction);

        const raycaster = new Raycaster(origin.to3(), direction.normalize());
        const hits = raycaster.intersectObjects(Game.world!.scene.children, true);

        for (const hit of hits) {
            let obj: any = hit.object;

            // walk up the parent chain since the stamped mesh may be a parent
            while (obj != null) {
                if (obj.bloodyFridayEntity) {
                    const entity = obj.bloodyFridayEntity;
                    debug("hit entity", entity.uuid);

                    let damage = Math.random() * 3;
                    Game.networking.damageEntity(entity.uuid, damage);
                    Game.sounds.playShoot();

                    HitConfirmOverlay.INSTANCE.doHit(120);

                    return;
                }
                obj = obj.parent;
            }
        }
    }
}
