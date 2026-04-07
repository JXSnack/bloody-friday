const WebSocket = require('ws')

const authedClients = []

class Client {
    constructor(uuid, authDate, ws) {
        this.uuid = uuid;
        this.authDate = authDate;
        this.ws = ws;
    }
}

const wss = new WebSocket.Server({ port: 8080 })
let lastTeam = 0;

wss.on('connection', (ws) => {
    console.log("client connected")
    let authed = false;
    let self = null;
    
    ws.on('message', (message) => {
        if (!authed) {
            self = new Client(message.toString(), new Date(), ws);
            authedClients.push(self);
            authed = true;
            console.log("authed " + JSON.stringify(self));
            console.log(authedClients)
            
            // set team
            ws.send(JSON.stringify({"sender": "server", "type": "team", "teamId": lastTeam % 2}))
            lastTeam++;
            
            return;
        }
        
        let data = JSON.parse(message.toString());
        let msgType = data.msgType
        
        if (msgType === "broadcast") {
            wss.clients.forEach((client) => {
                let msg = message.toString();
                if (client.readyState === WebSocket.OPEN) {
                    client.send(msg);
                }
            })
        } else if (msgType === "direct") {
            let target = data.msgDirectTarget;
            for (let client of authedClients) {
                if (client.uuid === target) {
                    client.ws.send(message.toString())
                    console.log("sent direct message")
                }
            }
        } else {
            console.log("received incorrect msgType: " + msgType)
        }
    })
    
    ws.on('close', () => {
        console.log("client disconnected")
        
        if (!authed) return;
        authedClients.splice(authedClients.indexOf(self), 1);
        
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({"sender": "server", "type": "disconnect", "uuid": self.uuid}))
            }
        })
    })
})

console.log("running on ws://localhost:8080")
