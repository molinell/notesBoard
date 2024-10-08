import { webSocket } from './websocket.js'
import { Events , NoteColors} from './utils.js';

let socket

function connectWS(){
    socket = webSocket()
}

//flytta på element (source: w3schools tutorial)
function dragElement(elem) {
    var diffX = 0, diffY = 0, mouseOrigX = 0, mouseOrigY = 0;
    //elem.onmousedown = dragMouseDown;
    dragMouseDown()

    function dragMouseDown(evt) {
        evt = evt || window.event;
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
        evt = evt || window.event;
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
        socket.send(JSON.stringify({
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
    }
}

function editNote(elem) {
    console.log("double click")
    elem.contentEditable = true
    elem.focus()
    //console.log(elem.id)
    elem.addEventListener('input', (evt) => {
        console.log(elem.innerText)
        socket.send(JSON.stringify({
            event: Events.Content,
            elemId: elem.id,
            value: elem.innerText
        }));
    });
}

function addNote() {
    console.log("new note")
    //behöver dynamsikt hitta hur många notes de finns
    var noteCount = 3
    document.querySelector(".note-container").innerHTML += `
    <div id="note${noteCount}" class="notes" onmousedown="dragElement(this)">
            <button type="button" class="rm-btn">✕</button>
            <div id="content${noteCount}" class="note-content"></div>
        </div>`

    const newNote = document.querySelector(`#note${noteCount}`)

    console.log("added note " + newNote.id)

    newNote.style.top = '50%'
    newNote.style.left = '50%'
    newNote.style.transform = 'translate(50%, 50%)'
    const noteColor = NoteColors[Math.floor(Math.random() * NoteColors.length)]
    newNote.style.background = noteColor
    socket.send(JSON.stringify({
        event: Events.Add,
        elemId: newNote.id,
        noteCount: noteCount,
        noteColor: noteColor
    }))

    editNote(document.querySelector(`#content${noteCount}`))
}

function removeNote(elem) {
    var note = elem.parentElement
    const noteId = note.id
    console.log("remove note " + noteId)
    note.remove()

    socket.send(JSON.stringify({
        event: Events.Remove,
        elemId: noteId,
    }));
}

export { dragElement, addNote, editNote, removeNote, connectWS }
