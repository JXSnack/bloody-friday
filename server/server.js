const WebSocket = require('ws')

const authedClients = []

class Client {
    constructor(uuid, authDate) {
        this.uuid = uuid;
        this.authDate = authDate;
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
            self = new Client(message.toString(), new Date());
            authedClients.push(self);
            authed = true;
            console.log("authed " + JSON.stringify(self));
            console.log(authedClients)
            
            // set team
            ws.send(JSON.stringify({"sender": "server", "type": "team", "teamId": lastTeam % 2}))
            lastTeam++;
            
            return;
        }
        
        wss.clients.forEach((client) => {
            let msg = message.toString();
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        })
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
