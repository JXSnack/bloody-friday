import {Entity} from "./entity";
import {Scene3D} from "enable3d";
import {Game} from "../util";

export class Player extends Entity {
    constructor(scene: Scene3D) {
        super("player", scene);
    }

    create() {
        this.mesh = this.scene.physics.add.box(
            {...this.pos, ...this.hitboxSize, mass: this.mass},
            {phong: {color: 0xffffff}}
        );
    }

    update() {
        const speed = 5;
        let vx= 0, vz = 0;

        if (Game.keys["KeyA"]) vx = -speed;
        if (Game.keys["KeyD"]) vx =  speed;
        if (Game.keys["KeyW"]) vz = -speed;
        if (Game.keys["KeyS"]) vz =  speed;

        const vy = this.mesh.body.velocity.y;
        this.mesh.body.setVelocity(vx, vy, vz);

        if (Game.keys["Space"]) {
            this.mesh.body.applyForceY(0.5)
        }
    }
}
