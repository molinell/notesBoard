import { Events, NoteCount } from './utils.js';

const WS_URL = 'womws-ayhkhrbua5bcdnbq.northeurope-01.azurewebsites.net'

function webSocket() {
    document.querySelector('#conn_status').innerHTML = "Connecting..."
    console.log("connecting...")
    // Create a WebSocket connection
    const socket = new WebSocket(`wss://${WS_URL}?access_token=${localStorage.getItem("jwt_token")}&boardId=${localStorage.getItem("board_id")}`); //`ws://localhost:8080?token=${WS_TOKEN}`
    //const socket = new WebSocket(`ws://localhost:8080?access_token=${localStorage.getItem("jwt_token")}&boardId=${localStorage.getItem("board_id")}`); //`ws://localhost:8080?token=${WS_TOKEN}`
    // Connection established 
    socket.onopen = function (event) {
        console.log('Connected to WebSocket server');
    };

    // Message listener
    socket.onmessage = function (event) {
        console.log('Received message:', event.data);
        const data = JSON.parse(event.data);

        if (data.status == 0) {
            
            document.querySelector('#err').innerHTML = '';

            switch (data.event) {
                case Events.CONNECTION: {
                    document.querySelector('#conn_status').innerHTML = (data.connClients > 1) ? `${data.connClients} users on this board` : "You're all alone here"
                    break
                }

                case Events.MOVE: {
                    const elem = document.querySelector(`#${data.elemId}`)
                    if(elem == null) break
                    elem.style.top = data.top
                    elem.style.left = data.left
                    elem.setAttribute("data-modified", "true")
                    break
                }

                case Events.CONTENT: {
                    const elem = document.querySelector(`#${data.elemId}`)
                    if(elem == null) break
                    elem.innerText = data.value
                    elem.setAttribute("data-modified", "true")
                    break
                }

                case Events.ADD: {
                    document.querySelector(".note-container").innerHTML += `
                    <div id="${data.elemId}" class="notes">
                        <div id=button-wrap>
                            <button type="button" class="color" data-color="#b4d9ff">🧊</button>
                            <button type="button" class="color" data-color="#f5bfbf">𓍢ִ໋🌷͙֒</button>
                            <button type="button" class="color" data-color="#b9dfb1">🍵</button>
                            <button type="button" class="color" data-color="#d5d1ff">🔮</button>
                            <button type="button" class="rm-btn">✕</button>
                        </div>
                        <div id="${data.elemId}-content" class="note-content"></div>
                    </div>`

                    const newNote = document.querySelector(`#${data.elemId}`)

                    newNote.style.top = '50%'
                    newNote.style.left = '50%'
                    newNote.style.transform = 'translate(50%, 50%)'
                    newNote.style.background = data.noteColor
                    newNote.setAttribute("data-new", "true")
                    console.log("Added new note")
                    NoteCount.add() //Increase everyones notecount
                    break
                }

                case Events.REMOVE: {
                    const elem = document.querySelector(`#${data.elemId}`)
                    if(elem == null) break
                    elem.remove()
                    break
                }

                case Events.COLOR: {
                    const elem = document.querySelector(`#${data.elemId}`)
                    if(elem == null) break
                    elem.style.background = data.color
                    elem.setAttribute("data-modified", "true")
                    break
                }

                case Events.SAVE: {
                    console.log("saving")
                    for(const [elemId, dataId] of Object.entries(data.savedNotes)){
                        console.log(elemId+ " : " + dataId)
                        const elem = document.querySelector(`#${elemId}`)
                        if(elem == null) continue
                        elem.setAttribute("data-id", dataId)
                        elem.removeAttribute("data-modified")
                        elem.removeAttribute("data-new")
                    }
                    document.querySelector('#save-cont').innerHTML = "<p>All changes saved!</p>"
                    setTimeout(() => {
                        document.querySelector('#save-cont').innerHTML = ""
                    }, 5000)
                    break
                }

                default:
                    break
            }
        } else {
            document.querySelector('#err').innerHTML = `<h3>${data.msg}</h3>`;
        }

    };

    // Connection closed 
    socket.onclose = function (event) {
        console.log('Connection closed');
        document.querySelector('#conn_status').innerHTML = "Connection closed <button type='button' id='reconn-btn'>Reconnect</button>";
    };

    return socket
}

export { webSocket }
