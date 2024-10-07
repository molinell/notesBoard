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

export { Events }
