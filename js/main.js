import { dragElement, addNote, editNote, removeNote } from './functionality.js'

window.dragElement = dragElement //enklast såhär, att göra till global

document.addEventListener('click', (evt) => {
    if(evt.target.classList == 'rm-btn') removeNote(evt.target)
})

document.querySelector("#add-note").addEventListener('click', () => {
    addNote()
})

document.addEventListener('dblclick', (evt) => {
    if(evt.target.classList == 'note-content') editNote(evt.target)
})
