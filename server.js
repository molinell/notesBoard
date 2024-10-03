const WebSocket = require('ws')
const os = require('os')
require('dotenv').config()
const jwt = require("jsonwebtoken")
//const authorise = require("../middleware/auth")

const PORT = process.env.PORT || 5000
const wss = new WebSocket.Server({ port: PORT });
const clients = [5]

function authorise(urlParams) {
    try{
        const token = urlParams.get('access_token')
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        console.log(`Token authorised for user ${userData.sub} ${userData.name}`)
        //userData = userData

        return {status: 0, userData: userData}
    } catch(err) {
        return {status: 1, userData: null}
    }
}

// URL example: ws://my-server?token=my-secret-token
wss.on('connection', (ws, req) => {

    const urlParams = new URLSearchParams(req.url.slice(1));
    const {status, userData} = authorise(urlParams)
    if(status == 1){
        ws.send(JSON.stringify({
            status: 1,
            msg: 'ERROR: Invalid JWT token.'
        }));
        ws.close();
    }
    console.log('Client connected: ' + req.headers['sec-websocket-key']);

    const boardId = urlParams.get('boardId')
    parseInt(boardId)

    if(clients[boardId] == null) {
        clients[boardId] = new Set()
        clients[boardId].add(ws)
    }

    if(!clients[boardId].has(ws)) clients[boardId].add(ws)

    clients[1].forEach(client => {

        client.send(JSON.stringify({
            msg: "",
            status: 0,
            connClients: clients[1].size
         }));
        })
    console.log(`Client count: ${clients.size}`)

    ws.on('message', (message) => {
        //const strMsg = String(message)
        //console.log('Received message:', strMsg);
        const jsonMsg = JSON.stringify(message)
        const strMsg = "Note position: " + String(jsonMsg.top) + " " + String(jsonMsg.bottom)

        // Send a response back to the client along with some other info
        clients[1].forEach(client => {
            //if(client == ws) return //sickar inte tillbaka till samma client

            client.send(JSON.stringify({
                status: 0,
                msg: strMsg,
                connClients: clients.size
            }));
        })
       
    });

    ws.on('close', () => {
        /*if(clients != null){
            for (let i = 0; i < clients.length; i++) {
            if(clients[i].has(ws)) clients[i].delete(ws)
        }
        }*/

            clients[1].delete(ws)
        
        console.log('Client disconnected');
    });
});
