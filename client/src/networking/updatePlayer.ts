import {debug, Game, Team, Vec} from "../util";
import {Player} from "../entity/player";

export function updatePlayer(sender: string, data: any) {
    if (Game.world == null) return;

    let rawEntity = Game.world.getEntity(sender);

    if (data.entityType == "player") {
        if (rawEntity == undefined) {
            let entity = new Player(Game.world);
            rawEntity = entity;
            // @ts-ignore
            entity.uuid = sender;
            entity.remote = true;
            entity.name = data["name"];
            Game.world.addEntity(entity);

            entity.mesh.body.setCollisionFlags(2);
            entity.mesh.body.setVelocity(0, 0, 0);
            entity.mesh.body.setAngularVelocity(0, 0, 0);
        }
    } else {
        return;
    }

    rawEntity.handlePacket(sender, data);
}
