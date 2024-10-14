const WebSocket = require('ws')
require('dotenv').config()
const jwt = require("jsonwebtoken")

const PORT = process.env.PORT || 8080
const wss = new WebSocket.Server({ port: PORT });
const clients = []

function authorise(urlParams) {
    try {
        const token = urlParams.get('access_token')
        const userData = jwt.verify(token, process.env.JWT_SECRET)

        console.log(`Token authorised for user ${userData.sub} ${userData.name}`)

        return { status: 0, userData: userData }
    } catch (err) {
        console.log(err)
        return { status: 1, userData: null }
    }
}

wss.on('connection', (ws, req) => {

    const urlParams = new URLSearchParams(req.url.slice(1));
    const { status, userData } = authorise(urlParams)

    //client unauthorised, close connection
    if (status == 1) {
        ws.send(JSON.stringify({
            status: 1,
            msg: 'ERROR: Unauthorised.'
        }));
        ws.close();
    }

    const boardIdString = urlParams.get('boardId')
    const boardId = boardIdString.split("-")[1]

    console.log("On board " + boardId)

    if (clients[boardId] == null) {
        clients[boardId] = new Set()
        clients[boardId].add(ws)
    }

    if (!clients[boardId].has(ws)) clients[boardId].add(ws)

    clients[boardId].forEach(client => {

        client.send(JSON.stringify({
            msg: "",
            status: 0,
            event: "Connection",
            connClients: clients[boardId].size
        }));
    })

    ws.on('message', (message) => {

        data = JSON.parse(message)
        data.status = 0
        jsonData = JSON.stringify(data)

        // Send a response back to the clients
        clients[boardId].forEach(client => {
            if (client == ws && data.event != "Connection") return //Doesn't send back to "sender", unless message is of type "connection"

            client.send(jsonData)
        })

    });

    ws.on('close', () => {
        clients[boardId].delete(ws)

        clients[boardId].forEach(client => {

            client.send(JSON.stringify({
                msg: "",
                status: 0,
                event: "Connection",
                connClients: clients[boardId].size
            }));
        })

    });
});
