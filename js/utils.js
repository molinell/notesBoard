/**
* "enum" för typer av event som kan ske som sickas till ws
*/
const Events = Object.freeze({
    CONNECTION: "Connection", //ny ws client, denna sickas främst från servern
    MOVE: "Move", //Noten flyttades
    CONTENT: "Content", //Innehållet ändrade
    ADD: "Add", //ny note
    REMOVE: "Remove",
    COLOR : "Color", //byte av färg
    SAVE: "Save" //någon spara boarden
})

const NoteColors = [
    "#b4d9ff",
    "#e9bff5",
    "#f5bfbf",
    "#b9dfb1",
    "#ffcd87",
    "#d5d1ff",
    "#9fd2ca",
    "#faec90"
]

const NoteCount = {
    COUNT: 0,
    add(){return this.COUNT += 1},
    reset(){this.COUNT = 0}
}

export { Events, NoteColors, NoteCount }
