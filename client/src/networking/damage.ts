import {Game} from "../util";

export function handleDamage(sender: string, data: any) {
    let damage = data["amount"];
    Game.self!.health -= damage;
}
