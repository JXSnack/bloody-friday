import {Game} from "../util";

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
        console.log("Received packet");

        const data = JSON.parse(event.data);

        if (Game.self == null) return;
        if (data["sender"] == Game.self.uuid) return;

        console.log(data);
    }

    send(sender: string, message: any) {
        message["sender"] = sender;
        this.socket.send(JSON.stringify(message))
    }
}
