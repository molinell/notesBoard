import { Events } from './utils.js';

//JWT_TOKEN = localStorage.getItem('jwt_token')

function webSocket() {
    document.querySelector('#conn_status').innerHTML = "Connecting..."
    console.log("connecting...")
    // Create a WebSocket connection
    const socket = new WebSocket("ws://localhost:8080?access_token=" + localStorage.getItem("jwt_token") + "&boardId=1"); //`ws://localhost:8080?token=${WS_TOKEN}`

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
            document.querySelector('#out').innerHTML = (data.msg == "") ? document.querySelector('#out').innerHTML : data.msg;
            document.querySelector('#err').innerHTML = '';

            switch (data.event) {
                case Events.Connection: {
                    document.querySelector('#conn_status').innerHTML = `${data.connClients} connected`
                    break
                }

                case Events.Move: {
                    elem = document.querySelector(`#${data.elemId}`)
                    elem.style.top = data.top
                    elem.style.left = data.left
                    break
                }

                case Events.Content: {
                    elem = document.querySelector(`#${data.elemId}`)
                    elem.innerText = data.value
                    break
                }

                case Events.Add: {
                    document.querySelector(".note-container").innerHTML += `<div id="${data.elemId}" class="notes" onmousedown="dragElement(this)">
                            <p id="content${data.noteCount}" ondblclick="editNote(this)"></p> </div>`

                    newNote = document.querySelector(`#${data.elemId}`)

                    newNote.style.top = '50%'
                    newNote.style.left = '50%'
                    newNote.style.transform = newNote.style.translate('50%', '50%')
                }

                default:
                    break
            }
        } else {
            document.querySelector('#err').innerHTML = data.msg;
        }

    };

    // Connection closed 
    socket.onclose = function (event) {
        console.log('Connection closed');
        document.querySelector('#conn_status').innerHTML = "Connection closed <button type='button' onClick=webSocket()>Reconnect</button>";
    };

    document.querySelector('#in').addEventListener('input', (evt) => {
        socket.send(evt.target.value);
    });

    return socket
}

export { webSocket }
