import { dragElement, addNote, editNote, removeNote, connectWS } from './functionality.js'
const API_URL = "http://localhost:8088";

window.dragElement = dragElement //enklast såhär, att göra till global

document.addEventListener('click', (evt) => {
    if(evt.target.classList == 'rm-btn') removeNote(evt.target)
    if(evt.target.id == 'reconn-btn') connectWS()
    if(evt.target.id == 'boards-container') console.log("tjennaa")
})

document.querySelector("#add-note").addEventListener('click', () => {
    addNote()
})

document.addEventListener('dblclick', (evt) => {
    if(evt.target.classList == 'note-content') editNote(evt.target)
})



