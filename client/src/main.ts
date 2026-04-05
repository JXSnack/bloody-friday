const socket = new WebSocket('ws://localhost:8080')

socket.onopen = () => {
    console.log("connected")

    setInterval(() => {
        socket.send(JSON.stringify({
            type: 'ping',
            time: Date.now()
        }))
    }, 1000)
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log(data)
}
