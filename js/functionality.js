import { webSocket } from './websocket.js'
import { Events, NoteColors } from './utils.js';

//const API_URL = "http://localhost:8088";
const API_URL = "https://notes-board.azurewebsites.net/";

let SOCKET = null

let NOTE_COUNT = 0 //håller koll på hur många notes det finns displayade

const boardChange = new Event("boardchange") //custom event för när en note ändras

//flytta på element (source: w3schools tutorial)
function dragElement(evt, elem) {
    var diffX = 0, diffY = 0, mouseOrigX = 0, mouseOrigY = 0;
    const ogTop = elem.style.top, ogLeft = elem.style.left
    //elem.onmousedown = dragMouseDown;
    dragMouseDown(evt)

    function dragMouseDown(evt) {
        evt = evt //|| window.event;
        evt.preventDefault();

        //musposition när man först trycker på noten
        mouseOrigX = evt.clientX;
        mouseOrigY = evt.clientY;

        //musläpp --> sluta
        document.onmouseup = closeDragElement;

        //Musflytt --> flytta på elementet
        document.onmousemove = elementDrag;
    }

    function elementDrag(evt) {
        evt = evt //|| window.event;
        evt.preventDefault();

        //räkna skillnaden mellan föregående och nuvarande musposition
        diffX = mouseOrigX - evt.clientX;
        diffY = mouseOrigY - evt.clientY;
        mouseOrigX = evt.clientX;
        mouseOrigY = evt.clientY;

        //räkna nya positionen till elementet
        elem.style.top = (elem.offsetTop - diffY) + "px";
        elem.style.left = (elem.offsetLeft - diffX) + "px";

        //sicka härifrån note positionen till ws
        SOCKET.send(JSON.stringify({
            event: Events.Move,
            elemId: elem.id,
            top: elem.style.top,
            left: elem.style.left
        }))
    }

    function closeDragElement() {
        //sluta allt när musen släpps
        document.onmouseup = null;
        document.onmousemove = null;

        //loggar ändast ändringar om de faktist skett
        if(elem.style.top != ogTop && elem.style.left != ogLeft){
            elem.setAttribute("data-modified", "true")
            document.dispatchEvent(boardChange)
        } 
    }


}

function editNote(elem) {
    console.log("double click")
    const ogText = elem.innerText;
    elem.contentEditable = true
    elem.focus()
    //console.log(elem.id)
    elem.addEventListener('input', (evt) => {
        console.log(elem.innerText)
        SOCKET.send(JSON.stringify({
            event: Events.Content,
            elemId: elem.id,
            value: elem.innerText
        }));
    });
    
    
    elem.addEventListener('blur', () => {
        //loggar ändast ändringar om de faktist skett
        if(elem.innerText != ogText){
            elem.setAttribute("data-modified", "true")
            document.dispatchEvent(boardChange)
        } 
    })
}

function addNote() {
    console.log("new note")

    document.querySelector(".note-container").innerHTML += `
    <div id="note${++NOTE_COUNT}" class="notes">
            <button type="button" class="rm-btn">✕</button>
            <div id="note${NOTE_COUNT}-content" class="note-content"></div>
        </div>`

    const newNote = document.querySelector(`#note${NOTE_COUNT}`)

    console.log("added note " + newNote.id)

    newNote.style.top = '25%'
    newNote.style.left = '50%'
    //newNote.style.transform = 'translate(50%, 50%)'
    const noteColor = NoteColors[Math.floor(Math.random() * NoteColors.length)]
    newNote.style.background = noteColor
    newNote.setAttribute("data-new", "true")
    SOCKET.send(JSON.stringify({
        event: Events.Add,
        elemId: newNote.id,
        noteCount: NOTE_COUNT,
        noteColor: noteColor
    }))

    editNote(document.querySelector(`#${newNote.id}-content`))
    document.dispatchEvent(boardChange)
}

function displayNotes(notes) {
    // Display in separate divs 
    const notesContainer = document.querySelector('.note-container');
    notesContainer.innerHTML = '';

    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.id = `note${NOTE_COUNT}`; //tänker att själva idn är bara note1, note2 osv så när man lägger till en ny kommer den i följd
        // Unique id for each note 

        noteElement.innerHTML =
            `<div id=outerwrap>
            <div id=innerwrap>
                 <div id="button-wrap">
                    <button class="color-btn" data-color="red">❤️</button>
                    <button class="color-btn" data-color="purple">💜</button>
                    <button class="color-btn" data-color="blue">💙</button>
                    <button class="del-btn">✖️</button>
                 </div>
                    <div id=box>
                        <p id=notes>${note.note}</p>
                    </div>
            </div>
         </div>`;

        noteElement.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () =>
                changeNoteColor(note.id, btn.dataset.color));

            noteElement.querySelector('.del-btn').addEventListener('click', () => deleteNote(note.id))

        });
        noteElement.setAttribute("data-modified", "false")
        noteElement.setAttribute("data-id", note.id) //sätter den egentliga idn som attribute
        notesContainer.appendChild(noteElement);
    });
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

/*async*/ function saveBoard() {
    //Uncommenta sen när det finns en update metod
    /*
    document.querySelector('#save-btn').innerText = "saving..."
    const noteContainer = document.querySelector('.note-container')

    for (const child of noteContainer.children) {
        if (child.getAttribute('data-modified') == 'true') { 
            try {
                const FETCH_URL = `${API_URL}/${localStorage.getItem('boardId')}/notes${ (!child.getAttribute('data-new')) ? "/"+child.getAttribute('data-id') : "" }` //lägger till idn om inte ny
                const resp = await fetch( FETCH_URL , {
                    method: ((child.getAttribute('data-new') == 'true') ? "POST" : "UPDATE"),
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "note": child.querySelector(`${child.id}-content`).innerText,
                        "color": child.style.background,
                        "positionT": child.style.top,
                        "positionL": child.style.left
                    })
                })
                console.log("Saving successfull for " + child.id)


            } catch (error) {
                console.error("Error occurred during saving", error);
            }
        }
    }*/
    console.log("saved")
    document.querySelector('#save-btn').innerText = "All changes saved!"
    setTimeout(() => {
        document.querySelector('#save-btn').remove()
    }, 5000)
    
}

function removeNote(elem) {
    var note = elem.parentElement
    const noteId = note.id
    console.log("remove note " + noteId)
    note.remove()

    SOCKET.send(JSON.stringify({
        event: Events.Remove,
        elemId: noteId,
    }));
}


function connectWS() {
    if(SOCKET != null) SOCKET.close()
    SOCKET = webSocket()
}
//if(localStorage.getItem("board_id")) connectWS()

export { dragElement, addNote, editNote, removeNote, connectWS, fetchNotesForBoard, displayNotes, saveBoard, fetchBoards, displayBoards, displayNoBoardsMessage }
