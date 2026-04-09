import {Entity} from "./entity";
import {debug, Game, Vec} from "../util";
import {Player} from "./player";
import {handleExplosion} from "../networking/damage";
import {Vector3} from "three";

export class CarBombEntity extends Entity {
    private owner: Entity;

    private timeSinceSpawn: number = Date.now();
    private exploded: boolean = false;

    constructor(owner: Entity) {
        super("car_bomb_entity", owner.scene);

        this.owner = owner;
        this.stopMessingWithVelocity = true;
    }

    create() {
        super.create();

        let addVec = new Vec(0, 2, 0)

        if (this.remote) {
            this.mesh = this.scene.add.box(
                {...this.owner.getPos().withAdd(addVec)},
                {phong: {color: 0xffffff}}
            )
        } else {
            this.mesh = this.scene.physics.add.box(
                {...this.owner.getPos().withAdd(addVec)},
                {phong: {color: 0xffffff}}
            )
        }

        this.mesh.visible = false;

        this.loadModel(("/carbomb.glb"), () => {
            this.model!.scale.set(2, 2, 2)
        });

        if (!this.remote) {
            const dir = new Vector3();
            Game.world!.camera.getWorldDirection(dir);
            this.mesh.body.applyCentralImpulse(dir.x * 20, dir.y * 20, dir.z * 20);
        }
    }

    update() {
        if (this.timeSinceSpawn + 10 * 1000 < Date.now()) {
            Game.world!.removeEntity(this.uuid);
            return;
        }

        super.update();

        if (!this.remote && this.isColliding()) this.explode();
    }

    explode() {
        if (!this.mesh) return;

        if (this.exploded) return;
        this.exploded = true;

        const pos = this.getPos();
        const RADIUS = 1.5;

        for (const entity of Object.values(Game.world!["entities"])) {
            if (!(entity instanceof Player)) continue;
            const ePos = entity.getPos();
            if (Math.abs(ePos.x - pos.x) <= RADIUS &&
                Math.abs(ePos.y - pos.y) <= RADIUS &&
                Math.abs(ePos.z - pos.z) <= RADIUS) {
                entity.damage(entity.maxHealth, this.owner.uuid);
            }
        }

        // Tell everyone to remove it
        let data = {type: "explosion"}

        Game.networking.send(this.uuid, data);
        handleExplosion(this.uuid, data);
    }

    makePacket(): any {
        return {
            ...super.makePacket(),
            owner: this.owner.uuid
        }
    }

    handlePacket(sender: string, data: any) {
        super.handlePacket(sender, data);
    }
}
