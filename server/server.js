const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
    console.log("client connected")
    
    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        })
    })
    
    ws.on('close', () => {
        console.log("client disconnected")
    })
})

console.log("running on ws://localhost:8080")
