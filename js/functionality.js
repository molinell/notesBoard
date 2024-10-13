import { webSocket } from './websocket.js'
import { Events, NoteColors, NoteCount } from './utils.js';

//const API_URL = "http://localhost:8088";
const API_URL = "https://notes-board.azurewebsites.net";

let SOCKET = null

const boardChange = new Event("boardchange") //custom event for when a note is changed

//Move an element (source: w3schools tutorial https://www.w3schools.com/howto/howto_js_draggable.asp)
function dragElement(evt, elem) {
    var diffX = 0, diffY = 0, mouseOrigX = 0, mouseOrigY = 0;
    const ogTop = elem.style.top, ogLeft = elem.style.left

    dragMouseDown(evt)

    function dragMouseDown(evt) {
        evt = evt //|| window.event;
        evt.preventDefault();

        //Mouse position when first pressing note
        mouseOrigX = evt.clientX;
        mouseOrigY = evt.clientY;

        // --> stop dragging
        document.onmouseup = closeDragElement;

        //--> move an element
        document.onmousemove = elementDrag;
    }

    function elementDrag(evt) {
        evt = evt //|| window.event;
        evt.preventDefault();

        //Differece between previous and current mouse position
        diffX = mouseOrigX - evt.clientX;
        diffY = mouseOrigY - evt.clientY;
        mouseOrigX = evt.clientX;
        mouseOrigY = evt.clientY;

        //New position for the element
        elem.style.top = (elem.offsetTop - diffY) + "px";
        elem.style.left = (elem.offsetLeft - diffX) + "px";

        SOCKET.send(JSON.stringify({
            event: Events.MOVE,
            elemId: elem.id,
            top: elem.style.top,
            left: elem.style.left
        }))
    }

    function closeDragElement() {
        //Stop when mouse is released
        document.onmouseup = null;
        document.onmousemove = null;

        //Only log event if an actual change has occurred
        if(elem.style.top != ogTop && elem.style.left != ogLeft){
            elem.setAttribute("data-modified", "true")
            document.dispatchEvent(boardChange)
        } 
    }
}


function editNote(elem) {
    const ogText = elem.innerText;
    elem.contentEditable = true
    elem.focus()

    elem.addEventListener('input', (evt) => {
        console.log(elem.innerText)
        SOCKET.send(JSON.stringify({
            event: Events.CONTENT,
            elemId: elem.id,
            value: elem.innerText
        }));
    });
    
    
    elem.addEventListener('blur', () => {
        //Only log event if an actual change has occurred
        if(elem.innerText != ogText){
            elem.parentElement.setAttribute("data-modified", "true")
            document.dispatchEvent(boardChange)
        } 
    })
}

function addNote() {
    const uniqueId = `note${NoteCount.add()}-${Date.now()}`
    
        document.querySelector(".note-container").innerHTML += `
        <div id="${uniqueId}" class="notes">
                 <div id=button-wrap>
                    <button type="button" class="color" data-color="#b4d9ff">🧊</button>
                    <button type="button" class="color" data-color="#f5bfbf">🌷͙֒</button>
                    <button type="button" class="color" data-color="#b9dfb1">🍵</button>
                    <button type="button" class="color" data-color="#d5d1ff">🔮</button>
                    <button type="button" class="rm-btn">✕</button>
                </div>
                <div id="${uniqueId}-content" class="note-content"></div>
            </div>`

    const newNote = document.querySelector(`#${uniqueId}`)

    newNote.style.top = '25%'
    newNote.style.left = '50%'
    newNote.style.transform = 'translate(50%, 50%)'
    const noteColor = NoteColors[Math.floor(Math.random() * NoteColors.length)]
    newNote.style.background = noteColor
    newNote.setAttribute("data-new", "true")
    SOCKET.send(JSON.stringify({
        event: Events.ADD,
        elemId: newNote.id,
        noteCount: NoteCount.COUNT,
        noteColor: noteColor
    }))

    document.dispatchEvent(boardChange)
    editNote(document.querySelector(`#${newNote.id}-content`))
}

function displayNotes(notes) {
    NoteCount.reset()
    // Display in separate divs 
    const notesContainer = document.querySelector('.note-container');
    notesContainer.innerHTML = '';

    notes.forEach(note => {
        
        notesContainer.innerHTML += `
        
            <div id="note${NoteCount.add()}" class="notes">
            <div id=button-wrap>
                <button type="button" class="color" data-color="#b4d9ff">🧊</button>
                <button type="button" class="color" data-color="#f5bfbf">🌷͙֒</button>
                <button type="button" class="color" data-color="#b9dfb1">🍵</button>
                <button type="button" class="color" data-color="#d5d1ff">🔮</button>
                <button type="button" class="rm-btn">✕</button>
            </div>
                <div id="note${NoteCount.COUNT}-content" class="note-content">${note.note}</div>
            </div>`

        //
       const noteElement = document.querySelector(`#note${NoteCount.COUNT}`)

        noteElement.style.top = note.positionT
        noteElement.style.left = note.positionL
        noteElement.style.background = note.color

        noteElement.setAttribute("data-id", note.id) //Actual ID (in db) as an attribute

    });

    document.querySelector("#add-btn").style.visibility = 'visible'
    connectWS() //connect to ws once all notes are displayed
}

async function fetchBoards(token) {
    console.log(`Fetching boards for user wiht token ${token}`)
    const boardsResp = await fetch(`${API_URL}/boards`, { 
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    const boardsData = await boardsResp.json();
    console.log("Fetched boards:", boardsData);

    // Check if the response contains the notes
    if (boardsData && boardsData.boards) {
        console.log("User's boards:", boardsData.boards);
        displayBoards(boardsData.boards); // Call function to display notes
    } else {
        console.log("You have 0 boards, create one!");
        displayNoBoardsMessage()
    }
}

function displayBoards(boards) {
    const boardscontainer = document.getElementById("boards-container");
    boardscontainer.innerHTML = "";
    let count = 0;
    boards.forEach(board => {
        const boardElement = document.createElement("div");
    
    boardscontainer.innerHTML += `
        <div id="board-${count++}" class="boards" data-id="${board.id}">
       ${board.title}
        </div>`
    });
}


function displayNoBoardsMessage() {
    const boardsContainer = document.getElementById("boards-container");
    boardsContainer.innerHTML = "<p>You have no boards. Create a board to get started!</p>";
}

// Function to fetch and display notes for a specific board
async function fetchNotesForBoard(boardId) {
    try {
        const token = localStorage.getItem('jwt_token');

        const notesResp = await fetch(`${API_URL}/boards/${boardId}/notes`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!notesResp.ok) {
            console.error("Failed to fetch notes:", notesResp.statusText);
            return;
        }

        const notesData = await notesResp.json();
        console.log("Fetched notes for board:", notesData);

        // Call a function to display the notes (similar to displayBoards)
        displayNotes(notesData.notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
    }
}

function changeColor(button){
    const note = button.parentElement.parentElement

    const color = button.getAttribute('data-color');
    note.style.background = color; 
 
    note.setAttribute("data-modified", "true");

    SOCKET.send(JSON.stringify({
        event: Events.COLOR,
        elemId: note.id,
        color: color
    }))
  
    document.dispatchEvent(boardChange)
}

function colorBoard(board){
    document.querySelectorAll('.boards').forEach(board => {
        board.style.color = ''; 
    });
    const colors = ["#42f593", "#f542ad", "#42e3f5", "#f58a42", "#ef74fc", "#d9d36c"];

    board.style.color = colors[Math.floor(Math.random() * colors.length)];
}
async function saveBoard() {
    
    document.querySelector('#save-cont').innerHTML = "<p>saving...</p>"
    const noteContainer = document.querySelector('.note-container')
    const token = localStorage.getItem('jwt_token')
    let savedNotes = {}

    for (const child of noteContainer.children) {
        //Only save those with modifications / new
        if (child.getAttribute('data-modified') || child.getAttribute("data-new")) {
            try {
                const FETCH_URL = `${API_URL}/boards/${document.querySelector("#"+localStorage.getItem('board_id')).getAttribute("data-id")}/${ (!child.getAttribute('data-new')) ? child.getAttribute('data-id') : "notes" }` //lägger till idn om inte ny
                const resp = await fetch( FETCH_URL , {
                    method: ((child.getAttribute('data-new')) ? "POST" : "PUT"),
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "note": document.querySelector(`#${child.id}-content`).innerText,
                        "color": child.style.background,
                        "positionT": child.style.top,
                        "positionL": child.style.left
                    })
                })

                if(!resp.ok){
                    console.error("Fetch error: " + resp.status + resp.statusText)
                    document.querySelector('#save-cont').innerHTML = "<p>Saving failed</p>"
                    setTimeout(() => {
                        document.querySelector('#save-cont').innerHTML = `<button type="button" id="save-btn">save changes</button>`
                    }, 5000)
                } else {
                    console.log("Saving successfull for " + child.id)
                    const respData = await resp.json();
                    if(child.getAttribute("data-new"))child.setAttribute("data-id", respData.note.id) 

                    savedNotes[child.id] = respData.note.id

                    child.removeAttribute("data-modified")
                    child.removeAttribute("data-new")
                }

            } catch (error) {
                console.error("Error occurred during saving", error);
                document.querySelector('#save-cont').innerHTML = "<p>Saving failed</p>"
                setTimeout(() => {
                    document.querySelector('#save-cont').innerHTML = `<button type="button" id="save-btn">save changes</button>`
                }, 5000)
            }
        }
    }

    SOCKET.send(JSON.stringify({
        event: Events.SAVE,
        savedNotes: savedNotes
    }))

    document.querySelector('#save-cont').innerHTML = "<p>All changes saved!</p>"
    setTimeout(() => {
        document.querySelector('#save-cont').innerHTML = ""
    }, 5000)
    
}

async function removeNote(elem) {
    var note = elem.parentElement.parentElement;

    SOCKET.send(JSON.stringify({
        event: Events.REMOVE,
        elemId: note.id
    }));
    const noteId = note.getAttribute("data-id");
    note.remove()

    if(note.getAttribute("data-new")) return //early return if note is unsaved

    console.log("Remove note: " + noteId);

    const token = localStorage.getItem('jwt_token')

    try{
        const FETCH_URL = `${API_URL}/boards/${document.querySelector("#"+localStorage.getItem('board_id')).getAttribute("data-id")}${noteId ? `/${noteId}` : ''} ` 
        console.log("Urlen för delete: "+FETCH_URL)
        const resp = await fetch( FETCH_URL , {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }})
    } catch(error){
        console.error("Error occurred during delete", error);
    }
}


function connectWS() {
    if(SOCKET != null) SOCKET.close()
    SOCKET = webSocket()
}

export { dragElement, addNote, editNote, removeNote, connectWS, fetchNotesForBoard, displayNotes, saveBoard, fetchBoards, displayBoards, displayNoBoardsMessage, changeColor, colorBoard}
