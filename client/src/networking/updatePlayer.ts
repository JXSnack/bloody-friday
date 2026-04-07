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

        entity.mesh.body.setCollisionFlags(2);
        entity.mesh.body.setVelocity(0, 0, 0);
        entity.mesh.body.setAngularVelocity(0, 0, 0);
    }

    let datPos = data["pos"];
    entity.setPos(new Vec(datPos.x, datPos.y, datPos.z));

    let datRot = data["rot"];
    if (datRot != undefined) {
        entity.targetRot = new Vec(datRot.x, datRot.y, datRot.z);
    }

    let datTeam: Team = data["team"];
    if (datTeam != undefined && entity.model == undefined && !entity.isLoadingModel) {
        debug("setting model for " + sender);
        entity.modelOffset = new Vec(0, -1, 0);

        entity.loadModel(datTeam == Team.LOYALIST ? "/loyalist.glb" : "/nationalist.glb", () => {
            if (datTeam == Team.NATIONALIST) entity.model!.scale.set(1, 1, 1);
            else entity.model!.scale.set(0.5, 0.5, 0.5);
            if (Game.self == entity) {
                entity.model!.visible = false;
            }
        });
    }
}
