import {Item} from "./main";
import {Player} from "../entity/player";
import {debug, Game, Vec} from "../util";
import {Raycaster, Vector3} from "three";
import {HitConfirmOverlay} from "../hud/hitConfirm";
import {Entity} from "../entity/entity";
import {KillOverlay} from "../hud/killOverlay";

export class Gun extends Item {
    private readonly cooldown: number = 400;
    private lastShot: number = Date.now();

    public readonly fullAmmo: number = 20;
    private readonly reloadTime: number = 2500;
    public isReloading: boolean = false;
    public ammo: number = 5;

    constructor(owner: Player) {
        super(owner, "gun");
        this.modelOffset = new Vec(-0.23, 0.1, 0);
    }

    create() {
        super.create();

        if (this.owner == Game.self) this.modelOffset = this.modelOffset.withAdd(new Vec(0.15, 0.2, 0))
    }

    createMesh() {
        this.loadModel("/gun.glb", () => {
            this.model?.scale.set(0.2, 0.2, 0.2);
        })
    }

    use() {
        if (this.lastShot + this.cooldown > Date.now()) return;
        if (this.ammo <= 0) {
            this.doReload();
            return;
        }

        this.ammo--;
        this.lastShot = Date.now();

        const origin = Game.self!.getPos().withAdd(new Vec(0, 0.5, 0));

        const direction = new Vector3();
        Game.world!.camera.getWorldDirection(direction);

        const raycaster = new Raycaster(origin.to3(), direction.normalize());
        const hits = raycaster.intersectObjects(Game.world!.scene.children, true);

        Game.sounds.playShoot();
        Game.networking.send(Game.self!.uuid, {"type": "someShot", "pos": Game.self!.getPos()})
        Game.self?.applyRecoil(0.15 + Math.random() * 0.1);

        for (const hit of hits) {
            let obj: any = hit.object;

            // walk up the parent chain since the stamped mesh may be a parent
            while (obj != null) {
                if (obj.bloodyFridayEntity) {
                    const entity: Player = obj.bloodyFridayEntity;

                    let damage = 5 + Math.random() * 5;
                    entity.damage(damage);

                    let points = 20 + Math.round(Math.random() * 30);
                    HitConfirmOverlay.INSTANCE.doHit(points);
                    Game.networking.pointsUpdate(points);

                    return;
                }
                obj = obj.parent;
            }
        }

        if (this.ammo <= 0) this.doReload();
    }

    private doReload() {
        Game.sounds.playReload();

        if (!this.isReloading) {
            this.isReloading = true;
            setTimeout(() => {
                this.ammo = this.fullAmmo;
                this.isReloading = false;
            }, this.reloadTime)
        }
    }
}
