/**
* "enum" for event types that are sent over ws
*/
const Events = Object.freeze({
    CONNECTION: "Connection", //New ws client, mostly sent by server
    MOVE: "Move", //Note was moved
    CONTENT: "Content", //Content of a note was changed
    ADD: "Add", //New note
    REMOVE: "Remove",
    COLOR : "Color", //Note changed color
    SAVE: "Save" //Board was saved
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
