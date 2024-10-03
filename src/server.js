const express = require('express')
const cors = require('cors') 
require('dotenv').config()
const PORT = process.env.PORT || 8088
const app = express(); 

// Endast om man är inne på denna domän så kan man hämta appen
app.use(cors({
  origin: process.env.DEV_ORIGIN || "https://people.arcada.fi"
  //origin: "*" // öppen för alla domäner
}))


const requestLog = (req, res, next) =>{
    console.log(`${req.method} request ${req.path}`)
    next()
}

app.use(requestLog);  // Körs för varje rutt efter detta 


// Syns på första sidan
app.get('/', (req, res) => {
  console.log(req.myVar)
    res.send("<h1>Hello!! with CORS</h1>") // Detta syns is 8088 ej live server
})

// Behövs för att man ska kunna ta emot JSON i req.body
// Allt här efter bli till JSON, alltid så efter app.use
app.use(express.json()) 

const notesRouter = require('./routes/notes')
app.use('/notes', notesRouter)  

const usersRouter = require('./routes/users')
app.use('/users', usersRouter) 

app.listen(PORT, () => { 
    console.log(`Server listening to port http://localhost:${PORT}`);
}) 
