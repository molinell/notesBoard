const express = require('express')
const router = express.Router()
const{ PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')
const prisma = new PrismaClient() 


// Denna endpoint returnerar BOARDS

// Get the boards connected to the user
router.get('/', authorize, async (req,res) => {

    try{
        console.log("boards / GET")
        const boards = await prisma.boards.findMany()
        res.status(200).send({msg: `Boards for user ${req.userData.name} ` , boards: boards})

    } catch (error) {
        console.log(error)
        res.status(500).send({msg: "ERROR, can't get boards"})
    }   
})

// POST a new board
router.post('/', authorize, async (req, res) => {
    const { title } = req.body; // Get the title from request body

    try {
        const newBoard = await prisma.boards.create({
            data: {
                title: title,
                authorId: req.userData.sub // Associate the board with authenticated user
            }
        });

        res.status(201).send({ msg: "New board created", board: newBoard });

    } catch (error) {
        console.log(error.message);
        res.status(500).send({ msg: "ERROR creating board" });
    }
});

// GET notes for a specific board
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


// POST new note for a specific board
router.post('/:boardId/notes', authorize, async (req, res) => {
    const { boardId } = req.params.boardId; // Get the board ID from the URL
    const { note, color, positionT, positionL } = req.body; // Get the note content from the request body

    try {
        // Check if the board exists and if the user has access to it
        const board = await prisma.boards.findUnique({
            where: { id: boardId },
        });

        if (!board) {
            return res.status(404).send({ msg: "Board not found or you don't have access to it" });
        }

        const newNote = await prisma.notes.create({
            data: {
                note: note,
                authorId: req.userData.sub, // JWT ID
                boardId: boardId, // Associate the note with the board
                color: color,
                positionT: positionT, 
                positionL: positionL,

            },
        });

        res.status(201).send({ msg: "New note created", note: newNote });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ msg: "Error creating note" });
    }
});


router.put('/:boardId/:noteId', authorize, async  (req, res) =>{
    const { boardId } = req.params.boardId;
    const { noteId } = req.params.noteId
    const { note, color, positionT, positionL } = req.body;
    
    try {
        const board = await prisma.boards.findUnique({
            where: { id: boardId },
        });

        if (!board) {
            return res.status(404).send({ msg: "Board not found or you don't have access to it" });
        }

        const updateNote = await prisma.notes.update({
            where: {
                id: noteId,
            },
            data: {
                note: note,
                color: color,
                positionT: positionT, 
                positionL: positionL,

            },
        });

        res.status(201).send({ msg: "Note updated", note: updateNote });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ msg: "Error updatning note" });
    }
 })

 router.delete('/:boardId/:noteId', authorize, async  (req, res) =>{
    const { boardId, noteId } = req.params;
    //const { noteId } = req.params.noteId

    try {
        const board = await prisma.boards.findUnique({
            where: { id: boardId },
        });

        if (!board) {
            return res.status(404).send({ msg: "Board not found or you don't have access to it" });
        }

        const deleteNote = await prisma.notes.delete({
            where: {
                id: noteId,
            },
        });

        res.status(200).send({ msg: "Note deleted", note: deleteNote });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ msg: "Error deleting note" });
    }
})


module.exports = router