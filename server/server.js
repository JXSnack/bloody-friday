const WebSocket = require('ws')

const authedClients = []

class Client {
    constructor(uuid, authDate) {
        this.uuid = uuid;
        this.authDate = authDate;
    }
}

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
    console.log("client connected")
    let authed = false;
    let self = null;
    
    ws.on('message', (message) => {
        let msg = message.toString();

        if (!authed) {
            self = new Client(msg, new Date());
            authedClients.push(self);
            authed = true;
            console.log("authed");
            return;
        }
        
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        })
    })
    
    ws.on('close', () => {
        console.log("client disconnected")
        
        if (!authed) return;
        authedClients.splice(authedClients.indexOf(self), 1)
    })
})

console.log("running on ws://localhost:8080")
