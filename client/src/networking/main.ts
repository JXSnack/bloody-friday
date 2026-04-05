export class NetworkingData {
    public readonly clientId = crypto.randomUUID();
    public readonly socket = new WebSocket("wss://localhost:8080")

    init() {
        this.socket.onopen = () => this.onSocketOpen();
        this.socket.onmessage = (event) => this.onSocketMessage(event);
    }

    onSocketOpen() {
        console.log("connected");
    }

    onSocketMessage(event: MessageEvent) {
        console.log("Received packet")

        const data = JSON.parse(event.data)
        console.log(data)
    }

    send(message: any) {
        this.socket.send(message)
    }
}
