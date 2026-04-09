import {debug, Game, Team, Vec} from "../util";
import {updatePlayer} from "./updatePlayer";
import {Entity} from "../entity/entity";
import {handleDamage, handleExplosion, handleKill, handleSomeShot} from "./damage";

export class NetworkingData {
    public readonly clientId = crypto.randomUUID();
    private readonly baseURL: string = `${window.location.protocol == "https:" ? "wss://friday.snackbag.net/ws/" : "ws://127.0.0.1:5174/"}}`;
    public readonly socket = new WebSocket(this.baseURL)

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
        let entity: Entity | null = Game.world.getEntity(sender);
        if (entity) {
            entity.lastPing = Date.now();
        }

        let type = data["type"];
        if (type == "update") updatePlayer(sender, data);
        else if (type == "damage") handleDamage(sender, data);
        else if (type == "kill") handleKill(sender, data);
        else if (type == "someShot") handleSomeShot(sender, data);
        else if (type == "explosion") handleExplosion(sender, data);
    }

    onServerMessage(data: any) {
        if (data["type"] == "disconnect") {
            Game.world?.removeEntity(data["uuid"]);
        } else if (data["type"] == "team") {
            Game.team = data["teamId"];
            debug("Received team " + Game.team)
        } else if (data["type"] == "pointsUpdate") {
            Game.nationalistPoints = data["nationalist"];
            Game.loyalistPoints = data["loyalist"];
        }
    }

    send(sender: string, message: any) {
        message["sender"] = sender;
        message["msgType"] = "broadcast";
        this.socket.send(JSON.stringify(message))
    }

    sendDirect(sender: string, to: string, message: any) {
        message["sender"] = sender;
        message["msgType"] = "direct";
        message["msgDirectTarget"] = to;
        this.socket.send(JSON.stringify(message))
    }

    pointsUpdate(points: number) {
        this.sendDirect(Game.self!.uuid, "server", {"type": "pointsUp", "team": Game.team!, "amount": points})
    }
}
