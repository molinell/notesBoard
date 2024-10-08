import { Events } from './utils.js';

//JWT_TOKEN = localStorage.getItem('jwt_token')

function webSocket() {
    document.querySelector('#conn_status').innerHTML = "Connecting..."
    console.log("connecting...")
    // Create a WebSocket connection
    const socket = new WebSocket("ws://localhost:8080?access_token=" + localStorage.getItem("jwt_token") + "&boardId="+localStorage.getItem("board_id")); //`ws://localhost:8080?token=${WS_TOKEN}`

    // Connection established 
    socket.onopen = function (event) {
        ///console.log('ON open message:', event.data);
        //const data = JSON.parse(event.data);
        console.log('Connected to WebSocket server');
        //document.querySelector('#conn_status').innerHTML = `${data.connClients} connected`;
    };

    // Message listener
    socket.onmessage = function (event) {
        console.log('Received message:', event.data);
        const data = JSON.parse(event.data);

        if (data.status == 0) {
            //document.querySelector('#out').innerHTML = (data.msg == "") ? document.querySelector('#out').innerHTML : data.msg;
            //document.querySelector('#err').innerHTML = '';

            switch (data.event) {
                case Events.Connection: {
                    document.querySelector('#conn_status').innerHTML = `${data.connClients} users on this board`
                    break
                }

                case Events.Move: {
                    const elem = document.querySelector(`#${data.elemId}`)
                    elem.style.top = data.top
                    elem.style.left = data.left
                    break
                }

                case Events.Content: {
                    const elem = document.querySelector(`#${data.elemId}`)
                    elem.innerText = data.value
                    break
                }

                case Events.Add: {
                    document.querySelector(".note-container").innerHTML += `<div id="${data.elemId}" class="notes" onmousedown="dragElement(this)">
                    <button type="button" class="rm-btn">✕</button>
                    <div id="content${data.noteCount}" class="note-content"></div>
                    </div>`

                    const newNote = document.querySelector(`#${data.elemId}`)

                    newNote.style.top = '50%'
                    newNote.style.left = '50%'
                    newNote.style.transform = 'translate(50%, 50%)'
                    newNote.style.background = data.noteColor
                    console.log("Added new note")
                    break
                }

                case Events.Remove: {
                    document.querySelector(`#${data.elemId}`).remove()
                }

                default:
                    break
            }
        } else {
            document.querySelector('#conn_status').innerHTML = data.msg;
        }

    };

    // Connection closed 
    socket.onclose = function (event) {
        console.log('Connection closed');
        document.querySelector('#conn_status').innerHTML = "Connection closed <button type='button' id='reconn-btn'>Reconnect</button>";
    };

    document.querySelector('#in').addEventListener('input', (evt) => {
        socket.send(evt.target.value);
    });

    return socket
}

export { webSocket }
