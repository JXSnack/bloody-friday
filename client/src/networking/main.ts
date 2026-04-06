import {debug, Game, Team, Vec} from "../util";
import {updatePlayer} from "./updatePlayer";

export class NetworkingData {
    public readonly clientId = crypto.randomUUID();
    public readonly socket = new WebSocket("ws://localhost:8080")

    init() {
        this.socket.onopen = () => this.onSocketOpen();
        this.socket.onmessage = (event) => this.onSocketMessage(event);
    }

    onSocketOpen() {
        console.log("authorizing...");
        this.socket.send(this.clientId);
    }

    onSocketMessage(event: MessageEvent) {
        const data = JSON.parse(event.data);

        let sender: string = data["sender"];
        if (sender == "server") {
            this.onServerMessage(data);
            return;
        }
        if (Game.self == null || Game.world == null) return;

        if (sender == Game.self.uuid) return;

        let type = data["type"];
        if (type == "update") updatePlayer(sender, data);
    }

    onServerMessage(data: any) {
        if (data["type"] == "disconnect") {
            Game.world?.removeEntity(data["uuid"]);
        } else if (data["type"] == "team") {
            Game.team = data["teamId"];
            debug("Received team " + Game.team)
        }
    }

    send(sender: string, message: any) {
        message["sender"] = sender;
        this.socket.send(JSON.stringify(message))
    }
}
