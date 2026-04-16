import {Entity} from "./entity";
import {debug, Game, GameState, Team, Vec} from "../util";
import {MathUtils} from "three";
import {FadeOverlay} from "../hud/fadeOverlay";
import {Player} from "./player";

export class Airplane extends Entity {
    private spawnDate!: number;
    private hasJumped: boolean = false;

    constructor() {
        super("airplane", Game.world!);
        this.targetPos = new Vec(0, 5, 0);
        this.modelOffset = new Vec(0, 2, 0);
    }

    create() {
        this.spawnDate = Date.now();
        this.createMesh();

        if (Game.team == Team.LOYALIST) FadeOverlay.INSTANCE.fadeIn();
    }

    createMesh() {
        this.mesh = this.scene.physics.add.box({...this.targetPos}, {phong: {color: 0xffffff}})
        this.mesh.visible = false;

        this.mesh.body.setCollisionFlags(2)
        this.mesh.body.setVelocity(0, 0, 0);
        this.mesh.body.setAngularVelocity(0, 0, 0);

        this.loadModel("/airplane.glb", () => {
            debug("airplane should be loaded")
            this.model!.scale.set(2, 2, 2)
        })
    }

    update() {
        super.update();

        let pos = new Vec(MathUtils.lerp(-40, 50, (Date.now() - this.spawnDate) / (10 * 1000)), 9, 0);
        this.setPos(pos);

        if (Date.now() - this.spawnDate > 10 * 1000) {
            if (Game.team == Team.LOYALIST) this.doParachute();
            Game.world!.removeEntity(this.uuid);
        }

        if (Game.team == Team.LOYALIST && Game.state == GameState.FLYING) {
            const orbitRadius = 15;
            const orbitSpeed = 0.0004; // radians per ms, tune to taste
            const orbitHeight = 8;

            const angle = Date.now() * orbitSpeed;
            const camX = pos.x + Math.sin(angle) * orbitRadius;
            const camZ = pos.z + Math.cos(angle) * orbitRadius;
            const camY = pos.y + orbitHeight;

            Game.world!.camera.position.set(camX, camY, camZ);
            Game.world!.camera.lookAt(pos.x, pos.y, pos.z);
        }

        if (Game.keys["KeyE"]) this.doParachute();
    }

    private doParachute() {
        if (this.hasJumped) return;
        this.hasJumped = true;

        FadeOverlay.INSTANCE.fadeIn();

        Game.self = new Player(Game.world!, this.getPos().withSub(new Vec(0, 2, 0)));
        Game.self.uuid = Game.networking.clientId;
        Game.world!.addEntity(Game.self);
        Game.world!.setupControls();
        Game.state = GameState.FIGHTING;
    }

    broadcast() {} // Don't broadcast!
}
