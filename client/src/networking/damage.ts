import {debug, Game} from "../util";
import {Player} from "../entity/player";
import {KillOverlay} from "../hud/killOverlay";

export function handleDamage(sender: string, data: any) {
    let damage = data["amount"];
    Game.self?.damage(damage, sender)
    Game.sounds.playHit();
}

export function handleKill(sender: string, data: any) {
    let entity: Player = Game.world?.getEntity(sender) as Player;
    debug(entity);
    KillOverlay.INSTANCE.doKilled(entity.name);
}
