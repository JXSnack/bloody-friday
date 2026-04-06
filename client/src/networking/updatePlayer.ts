import {debug, Game, Team, Vec} from "../util";
import {Player} from "../entity/player";

export function updatePlayer(sender: string, data: any) {
    if (Game.world == null) return;

    let entity = Game.world.getEntity(sender);
    if (entity == null) {
        entity = new Player(Game.world);
        // @ts-ignore
        entity.uuid = sender;
        entity.remote = true;
        Game.world.addEntity(entity);

        entity.mesh.body.setCollisionFlags(2); // CF_KINEMATIC_OBJECT
        entity.mesh.body.setVelocity(0, 0, 0);
        entity.mesh.body.setAngularVelocity(0, 0, 0);
    }

    let datPos = data["pos"];
    entity.setPos(new Vec(datPos.x, datPos.y, datPos.z));

    let datTeam: Team = data["team"];
    if (datTeam != undefined && entity.model == undefined) {
        debug("setting")

        entity.modelOffset = entity.modelOffset.withAdd(new Vec(0, -1, 0));

        entity.loadModel("/nationalist.glb", () => {
            entity.model!.scale.set(1, 1, 1);
            if (Game.self == entity) {
                entity.model!.visible = false;
            }
        });
    }

}
