import {PhysicsLoader, Project} from "enable3d";
import {MainScene} from "./scene/world";
import {Game} from "./util";

Game.sounds.init();

// @ts-ignore
document.addEventListener("game:init", (e: CustomEvent) => {
    Game.playerName = e.detail.username;
    Game.networking.init();
})

document.addEventListener("game:start", () => {
    Game.started = true;
    document.addEventListener("keydown", (e) => (Game.keys[e.code] = true));
    document.addEventListener("keyup", (e) => (Game.keys[e.code] = false));

    PhysicsLoader("/lib", () => new Project({scenes: [MainScene]}));

    // update loop
    const updateLoopMs = 1000 / 20;

    setInterval(() => {
        Game.doUpdate();
    }, updateLoopMs);
});
