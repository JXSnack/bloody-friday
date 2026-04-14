const WebSocket = require('ws')

const authedClients = []
let monitor = null;
let started = false;

class Client {
    constructor(uuid, name, authDate, ws) {
        this.uuid = uuid;
        this.name = name;
        this.authDate = authDate;
        this.ws = ws;
    }
}

const wss = new WebSocket.Server({ port: 5174 })
let lastTeam = 0;
let nationalistPoints = 0;
let loyalistPoints = 0;

wss.on('connection', (ws) => {
    console.log("client connected")
    let isMonitor = false;
    let authed = false;
    let self = null;
    
    ws.send(JSON.stringify({"sender": "server", "type": "hello"}))
    
    ws.on('message', (message) => {
        if (isMonitor) return;
        if (!authed) {
            if (message.toString() === "MONITOR") {
                isMonitor = true;
                handleMonitor(ws);
                return;
            }
            
            if (monitor == null) {
                ws.send(JSON.stringify({"sender": "server", "type": "authDenied", "reason": "Het spel is nog niet geopend. Probeer het zometeen nog een keer"}))
                return;
            }
            
            if (started) {
                ws.send(JSON.stringify({"sender": "server", "type": "authDenied", "reason": "Het spel is al begonnen, je kunt er helaas niet meer bij"}));
                return;
            }
            
            let uuid = message.toString().split(":::")[0];
            let name = message.toString().split(":::")[1];
            if (isNameUsed(name)) {
                ws.send(JSON.stringify({"sender": "server", "type": "authDenied", "reason": "Naam is al in gebruik"}))
                return;
            }
            
            self = new Client(uuid, name, new Date(), ws);
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
            if (target === "server") {
                let type = data.type;
                
                if (type === "pointsUp") {
                    let team = data.team;
                    if (team === 0) {
                        nationalistPoints += data.amount;
                    } else {
                        loyalistPoints += data.amount;
                    }
                    
                    broadcast({"sender": "server", "type": "pointsUpdate", "nationalist": nationalistPoints, "loyalist": loyalistPoints})
                }
                
                return;
            }
            
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
        if (isMonitor) return;
        console.log("client disconnected")
        
        if (!authed) return;
        authedClients.splice(authedClients.indexOf(self), 1);
        
        broadcast({"sender": "server", "type": "disconnect", "uuid": self.uuid})
    })
})

function handleMonitor(ws) {
    console.log("monitor handler")
    monitor = {ws: ws};
    
    ws.on("message", (message) => {
        if (message.toString() === "start") {
            started = true;
            console.log("MONITOR SENT START")
            broadcast({"sender": "server", "type": "startGame"})
        }
    })
    
    ws.on('close', () => {
        monitor = null;
        console.log("monitor cleared")
    });
}

function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    })
}

function isNameUsed(name) {
    for (let client of authedClients) {
        if (client.name.toLowerCase() === name.toLowerCase()) return true;
    }
    
    return false;
}

console.log("running on ws://127.0.0.1:5174")
