const express = require('express')
const router = express.Router()
const{ PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')
const prisma = new PrismaClient() 


// Denna endpoint returnerar BOARDS
// en del users har access till vissa boards
// Dessa accessright hämtas från DB

// Get the boards connected to the user
router.get('/', authorize, async (req,res) => {

    try{
        console.log("boards / GET")
        const boards = await prisma.boards.findMany({
            where: {
                authorId: req.userData.sub
              }
        })
        res.status(200).send({msg: `Boards for user ${req.userData.name} ` , boards: boards})

    } catch (error) {
        console.log(error)
        res.status(500).send({msg: "ERROR, can't get boards"})
    }   
})
// Notes har board id
//sen har varje note samma board id pluss ett eget ID

// har ej uppdareat prisma

router.get('/:boardId/notes', authorize, async (req, res) => {

    const boardId = req.params.boardId; // Get the boardId from the request parameters

    try {
        console.log(`Fetching notes for board ${boardId}`);
        
        // Check if the board exists and belongs to the user
        const board = await prisma.boards.findUnique({
            where: { id: boardId }
        });

        // Fetch notes associated with specific board
        const notes = await prisma.notes.findMany({
            where: {
                boardId: boardId 
            }
        });

        res.status(200).send({
            msg: `Notes for board ${boardId}`,
            notes: notes
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: "ERROR fetching notes for board" });
    }
})

// POST

router.post('/', authorize, async (req, res) => {
    const { title } = req.body; // Get the title from request body

    try {
        const newBoard = await prisma.boards.create({
            data: {
                title: title,
                authorId: req.userData.sub // Associate the board with the authenticated user
            }
        });

        res.status(201).send({ msg: "New board created", board: newBoard });

    } catch (error) {
        console.log(error.message);
        res.status(500).send({ msg: "ERROR creating board" });
    }
});

module.exports = router