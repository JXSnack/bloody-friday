import {debug, Game, Team, Vec} from "../util";
import {Player} from "../entity/player";

export async function updatePlayer(sender: string, data: any) {
    if (Game.world == null) return;

    let rawEntity = Game.world.getEntity(sender);

    if (data.entityType == "player") {
        if (rawEntity == undefined) {
            let entity = new Player(Game.world);
            rawEntity = entity;
            entity.uuid = sender;
            entity.remote = true;
            entity.name = data["name"];
            Game.world.addEntity(entity);

            entity.mesh!.body.setCollisionFlags(2);
            entity.mesh!.body.setVelocity(0, 0, 0);
            entity.mesh!.body.setAngularVelocity(0, 0, 0);
        }
    } else if (data.entityType == "car_bomb_entity") {
        if (rawEntity == undefined) {
            const owner = Game.world.getEntity(data.owner) as Player;
            if (!owner) return;

            const { CarBombEntity } = await import("../entity/carbomb");
            let entity = new CarBombEntity(owner);
            rawEntity = entity;
            entity.uuid = sender;
            entity.remote = true;
            Game.world.addEntity(entity);
        }
    } else {
        return;
    }

    rawEntity.handlePacket(sender, data);
}

export function handleDeath(sender: string, data: any) {
    // let entity = Game.world!.getEntity(sender);
    // if (entity == null || !(entity instanceof Player)) return;
    //
    // entity.removeMesh();

    // let's just remove them. quick and dirty
    Game.world?.removeEntity(sender);
}

export function handleRespawn(sender: string, data: any) {
    let entity = Game.world!.getEntity(sender);
    if (entity == null || !(entity instanceof Player)) return;

    entity.createMesh();
}
