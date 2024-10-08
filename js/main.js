import { dragElement, addNote, editNote, removeNote, connectWS } from './functionality.js'

window.dragElement = dragElement //enklast såhär, att göra till global
connectWS()

document.addEventListener('click', (evt) => {
    if(evt.target.classList == 'rm-btn') removeNote(evt.target)
    else if(evt.target.id == 'reconn-btn') connectWS()
})

document.querySelector("#add-note").addEventListener('click', () => {
    addNote()
})

document.addEventListener('dblclick', (evt) => {
    if(evt.target.classList == 'note-content') editNote(evt.target)
})
