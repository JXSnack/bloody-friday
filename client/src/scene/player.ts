import {ExtendedMesh} from "enable3d";
import {MainScene} from "./world";

 class Player {
    mesh: ExtendedMesh;

    constructor(scene: MainScene) {
        this.mesh = scene.physics.add.box(
            { x: 0, y: 2, z: 0, width: 1, height: 1, depth: 1, mass: 1 },
            { phong: { color: 0xffffff } }
        ) as ExtendedMesh;

        this.mesh.body.setAngularFactor(0, 0, 0);
    }

    update(keys: Record<string, boolean>) {

    }
}
