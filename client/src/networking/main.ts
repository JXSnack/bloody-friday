import {Game, Vec} from "../util";
import {Player} from "../entity/player";

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

        if (Game.self == null || Game.world == null) return;
        let sender: string = data["sender"];
        if (sender == "server") {
            this.onServerMessage(data);
            return;
        }

        if (sender == Game.self.uuid) return;

        let type = data["type"];
        if (type == "update") {
            let entity = Game.world.getEntity(sender);
            if (entity == null) {
                entity = new Player(Game.world);
                // @ts-ignore
                entity.uuid = sender;
                Game.world.addEntity(entity);
            }

            let posJSON = JSON.parse(data["pos"]);
            let pos = new Vec(posJSON.x, posJSON.y, posJSON.z);
            entity.setPos(pos);
        }
    }

    onServerMessage(data: any) {
        if (data["type"] == "disconnect") {
            Game.world?.removeEntity(data["uuid"]);
        }
    }

    send(sender: string, message: any) {
        message["sender"] = sender;
        this.socket.send(JSON.stringify(message))
    }
}
