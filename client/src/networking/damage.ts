import {debug, Game, Vec} from "../util";
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

export function handleSomeShot(sender: string, data: any) {
    let pos: Vec = data["pos"];
    const selfPos = Game.self!.getPos();

    const dx = Math.abs(pos.x - selfPos.x);
    const dy = Math.abs(pos.y - selfPos.y);
    const dz = Math.abs(pos.z - selfPos.z);

    if (dx > 20 || dy > 20 || dz > 20) return; // Inaudible, skip

    // 1.0 at center, quieter toward the edges
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const volume = Math.max(0, 1 - dist / (5 * Math.sqrt(3))) * 0.5; // max 0.5, quieter the farther away

    Game.sounds.playMiss(volume);
}

export function handleExplosion(uuid: string, data: any) {
    Game.world?.removeEntity(uuid);
}
