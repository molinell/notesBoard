const WebSocket = require('ws')
const os = require('os')
require('dotenv').config()
const jwt = require("jsonwebtoken")
//const authorise = require("../middleware/auth")

const PORT = process.env.PORT || 8080
const wss = new WebSocket.Server({ port: PORT });
const clients = []

function authorise(urlParams) {
    try{
        const token = urlParams.get('access_token')
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        const boardIdString = urlParams.get('boardId')
        const boardId = boardIdString.split("-")[1]

        console.log(`Token authorised for user ${userData.sub} ${userData.name}`)

        return {status: 0, boardId: boardId, userData: userData}
    } catch(err) {
        console.log(err)
        return {status: 1, boardId:-1, userData: null}
    }
}

// URL example: ws://my-server?token=my-secret-token
wss.on('connection', (ws, req) => {

    const urlParams = new URLSearchParams(req.url.slice(1));
    const {status, boardId, userData} = authorise(urlParams)
    if(status == 1){
        ws.send(JSON.stringify({
            status: 1,
            msg: 'ERROR: Unauthorised.'
        }));
        ws.close();
    }

    console.log("On board " + boardId)

    if(clients[boardId] == null) {
        clients[boardId] = new Set()
        clients[boardId].add(ws)
    }

    if(!clients[boardId].has(ws)) clients[boardId].add(ws)

    clients[boardId].forEach(client => {

        client.send(JSON.stringify({
            msg: "",
            status: 0,
            event: "Connection",
            connClients: clients[boardId].size
         }));
        })
    //console.log(`Client count: ${clients.size}`)

    ws.on('message', (message) => {
        
        data = JSON.parse(message)
        data.status = 0
        jsonData = JSON.stringify(data)

        // Send a response back to the client along with some other info
        clients[boardId].forEach(client => {
            if(client == ws && data.event != "Connection") return //sickar inte tillbaka till samma client

            client.send(jsonData)
        })
       
    });

    ws.on('close', () => {
        clients[boardId].delete(ws)

        for(let i = 0; i < clients.size; i++){
            clients[i].forEach(client => {

                client.send(JSON.stringify({
                    msg: "",
                    status: 0,
                    event: "Connection",
                    connClients: clients[i].size
                 }));
                })
        }
        
        console.log('Client disconnected');
    });
});
