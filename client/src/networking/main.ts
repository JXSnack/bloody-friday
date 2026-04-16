import {debug, Game, Team} from "../util";
import {handleDeath, handleLoyalistsSpawn, handleRespawn, updatePlayer} from "./updatePlayer";
import {Entity} from "../entity/entity";
import {handleDamage, handleExplosion, handleForceVel, handleKill, handleSomeShot} from "./damage";
import {Airplane} from "../entity/airplane";

export class NetworkingData {
    public readonly clientId = crypto.randomUUID();
    private readonly baseURL: string = `${window.location.protocol == "https:" ? "wss://friday.snackbag.net/ws/" : "ws://127.0.0.1:5174/"}`;
    public socket!: WebSocket;

    init() {
        this.socket = new WebSocket(this.baseURL);
        this.socket.onopen = () => this.onSocketOpen();
        this.socket.onmessage = (event) => this.onSocketMessage(event);
    }

    onSocketOpen() {
        console.log("authorizing...");
        this.socket.send(`${this.clientId}:::${Game.playerName}`);
    }

    onSocketMessage(event: MessageEvent) {
        const data = JSON.parse(event.data);

        let sender: string = data["sender"];
        if (sender == "server") {
            this.onServerMessage(data);
            return;
        }
        if (!Game.started) return;
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
        else if (type == "death") handleDeath(sender, data);
        else if (type == "respawn") handleRespawn(sender, data);
        else if (type == "forceVel") handleForceVel(sender, data);
    }

    onServerMessage(data: any) {
        if (data["type"] == "startGame") {
            if (Game.team == Team.LOYALIST) document.dispatchEvent(new CustomEvent("game:prepare"));
            else document.dispatchEvent(new CustomEvent("game:start"));
        } else if (data["type"] == "startLoyalists") {
            if (Game.team == Team.LOYALIST) document.dispatchEvent(new CustomEvent("game:start"));
            handleLoyalistsSpawn(data)
        } else if (data["type"] == "authDenied") {
            document.dispatchEvent(new CustomEvent("game:authDenied", {detail: {reason: data["reason"]}}));
        } else if (data["type"] == "hello") {
            console.log("received hello event")
        } else if (data["type"] == "kick") {
            this.socket.close();
            alert("Je werd gekickt")
            window.location.reload();
        } else if (data["type"] == "team") {
            Game.team = data["teamId"];
            debug("Received team " + Game.team)
        }

        if (!Game.started) return;

        if (data["type"] == "disconnect") {
            Game.world?.removeEntity(data["uuid"]);
        } else if (data["type"] == "pointsUpdate") {
            const beforeNationalist = Game.nationalistPoints;
            const beforeLoyalist = Game.loyalistPoints;

            Game.nationalistPoints = data["nationalist"];
            Game.loyalistPoints = data["loyalist"];

            Game.checkUnlocks(beforeNationalist, Game.nationalistPoints, Team.NATIONALIST);
            Game.checkUnlocks(beforeLoyalist, Game.loyalistPoints, Team.LOYALIST)
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
        if (!Game.self || !Game.team) {
            debug("Couldn't send points update because self or team is null")
            return;
        }

        this.sendDirect(Game.self.uuid, "server", {"type": "pointsUp", "team": Game.team, "amount": points})
    }
}
