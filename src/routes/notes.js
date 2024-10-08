const express = require('express')
const router = express.Router()
const{ PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')
const prisma = new PrismaClient() //instansierar objekt med new 


router.get('/', authorize, async (req,res) => {

    try{
        console.log("notes / GET")
        const notes = await prisma.notes.findMany({
            where: {
                authorId: req.userData.sub
              }
        })
        res.status(200).send({msg: `Notes for user ${req.userData.name} ` , notes: notes})

    } catch (error) {
        console.log(error)
        res.status(500).send({msg: "ERROR"})
    }   
})




/*
router.post('/', authorize, async (req, res) =>{ //Namnslös funktion = därför async, funkar med promises
    console.log(req.body);
    try{

        const newNote = await prisma.notes.create({
            data: {
                //COLORS 
                authorId: req.userData.sub,
                note: req.body.note,
                color: "b4d9ff"
            }
        }) //notes nu ett objekt i prisma (ORM/ODM)

        res.send({msg: "New note created"})
    
    } catch (error){
        console.log(error.message)
        res.status(500).send({msg: "ERROR"})
    }
    
})*/

/*
router.put('/:id', async (req, res) =>{
    console.log(req.body);

    const updateNote = await prisma.notes.update({
        where: {
          id: req.params.id,
        },
        data: {
          note: req.body.note,
        },
      })

      res.send({msg: `note ${req.params.id} updated`})
})

router.patch('/:id', (req, res) =>{
    console.log(req.body);

    tempNotes[req.params.id-1].note = req.body.note
    res.send({msg: `note ${req.params.id} updated with PATCH`})
})

router.delete('/:id', (req, res) =>{
    console.log(req.body);
    delete tempNotes.splice(req.params.id-1, 1).note 
    res.send({msg: `note ${req.params.id} deleted`})
})

*/

module.exports = router