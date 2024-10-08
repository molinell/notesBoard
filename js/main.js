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

document.querySelector('#button-login').addEventListener('click', () =>{
    const user = document.querySelector('#username').value;
    const pass = document.querySelector('#password').value;
    logIn(user, pass);
});

document.querySelector('#button-register').addEventListener('click', () =>{
    const username = document.querySelector('#username-reg').value;
    const password = document.querySelector('#password-reg').value;
    const email = document.querySelector('#email-reg').value;
    registerUser(username, password, email);
});



