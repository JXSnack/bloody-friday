import {PhysicsLoader, Project} from "enable3d";
import {MainScene} from "./scene/world";
import {Game, tryRequestFullscreen} from "./util";

Game.sounds.init();

// @ts-ignore
document.addEventListener("game:init", async (e: CustomEvent) => {
    console.log("received game:init")
    Game.playerName = e.detail.username;
    Game.networking.init();

    await Game.preloadModels();
})

document.addEventListener("game:start", () => {
    console.log("received game:start")
    if (Game.started) {
        console.log("I STOPPED YOU FROM FUCKING EVERYTHING UP!!!!!!!!")
        return;
    }

    Game.started = true;
    Game.timeSinceStarted = Date.now();
    document.addEventListener("keydown", (e) => {
        tryRequestFullscreen();
        (Game.keys[e.code] = true)
    });
    document.addEventListener("keyup", (e) => {
        tryRequestFullscreen();
        (Game.keys[e.code] = false)
    });

    PhysicsLoader("/lib", () => new Project({scenes: [MainScene]}));

    // update loop
    const updateLoopMs = 1000 / 20;

    setInterval(() => {
        Game.doUpdate();
    }, updateLoopMs);
});
