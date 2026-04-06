import {Game, Vec} from "../util";
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
}
