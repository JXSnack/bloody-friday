import {PhysicsLoader, Project} from "enable3d";
import {MainScene} from "./scene/world";
import {Game} from "./util";

document.addEventListener("keydown", (e) => (Game.keys[e.code] = true));
document.addEventListener("keyup",   (e) => (Game.keys[e.code] = false));

const socket = new WebSocket('ws://localhost:8080')

socket.onopen = () => {
    console.log("connected")

    setInterval(() => {
        socket.send(JSON.stringify({
            type: 'ping',
            time: Date.now()
        }))
    }, 1000)
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log(data)
}

PhysicsLoader("/lib", () => new Project({ scenes: [MainScene] }));
