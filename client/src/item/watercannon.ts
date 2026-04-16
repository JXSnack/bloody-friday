import {Item} from "./main";
import {Player} from "../entity/player";
import {debug, Game, Vec} from "../util";
import {Vector3} from "three";

export class WaterCannon extends Item {
    public canShoot: boolean = true;
    private cooldownMs: number = 3 * 1000;

    constructor(owner: Player) {
        super(owner, "water_cannon");
        this.modelOffset = new Vec(0.25, -1, 0);
        this.modelRotset = new Vec(0, 249.55, 0)
    }

    create() {
        super.create();

        if (this.owner == Game.self) this.modelOffset = this.modelOffset.withAdd(new Vec(-0.3, 0.6, 0.3))
    }

    createMesh() {
        this.loadModel("/cannon.glb", () => {
            this.model?.scale.set(0.2, 0.2, 0.2);
        })
    }

    use() {
        if (!this.canShoot) return;
        this.canShoot = false;

        debug("use water cannon")
        const pos = this.owner.getPos();
        const RADIUS = 8;

        for (const entity of Object.values(Game.world!["entities"])) {
            if (!(entity instanceof Player)) continue;

            const ePos = entity.getPos();
            if (Math.abs(ePos.x - pos.x) <= RADIUS &&
                Math.abs(ePos.y - pos.y) <= RADIUS &&
                Math.abs(ePos.z - pos.z) <= RADIUS) {

                const pos = this.owner.getPos();
                const dx = ePos.x - pos.x;
                const dz = ePos.z - pos.z;
                const dist = Math.sqrt(dx * dx + dz * dz) || 1;
                const force = 80;

                Game.networking.sendDirect(this.owner.uuid, entity.uuid, {"type": "forceVel", "vec": new Vec((dx / dist) * force, 3, (dz / dist) * force)})
            }
        }

        setTimeout(() => {
            this.canShoot = true;
        }, this.cooldownMs)
    }

    isUnlocked(): boolean {
        return Game.getOwnTeamPoints() >= Game.waterCannonUnlock;
    }
}
