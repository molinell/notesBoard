/**
* "enum" för typer av event som kan ske som sickas till ws
*/
const Events = Object.freeze({
    Connection: "Connection", //ny ws client, denna sickas främst från servern
    Move: "Move", //Noten flyttades
    Content: "Content", //Innehållet ändrade
    Add: "Add", //ny note
    Remove: "Remove"
})

const NoteColors = [
    "#b4d9ff",
    "#e9bff5",
    "#f5bfbf",
    "#b9dfb1",
    "#ffcd87",
    "#d5d1ff",
    "#9fd2ca"
]

export { Events, NoteColors }
