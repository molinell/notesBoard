const express = require('express')
const router = express.Router()
const{ PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')
const prisma = new PrismaClient() 


// Denna endpoint returnerar BOARDS samt dess NOTES

// Get boards
router.get('/', authorize, async (req,res) => {
// Har använt lektionsexemplen som hjälp i att få notes och boards, Code challenge för put
// Alla användare kommer åt alla boards
    try{
        console.log("boards / GET")
        const boards = await prisma.boards.findMany()
        res.status(200).send({msg: `Boards: ` , boards: boards})

    } catch (error) {
        console.log(error)
        res.status(500).send({msg: "ERROR, can't get boards"})
    }   
})

// POST board (Kan ej göras i frontend, mest för min skull i boards.http)
router.post('/', authorize, async (req, res) => {
    const { title } = req.body; 

    try {
        const newBoard = await prisma.boards.create({
            data: {
                title: title,
                authorId: req.userData.sub 
            }
        });

        res.status(201).send({ msg: "New board created: ", board: newBoard });

    } catch (error) {
        console.log(error.message);
        res.status(500).send({ msg: "ERROR creating board" });
    }
});

// GET notes för en specifik board
router.get('/:boardId/notes', authorize, async (req, res) => {
    const boardId = req.params.boardId; 

    try {
        console.log(`Fetching notes for board ${boardId}`);
        
        // Behöver id:n från boarden för att veta vilka notes som är kopplade
        const board = await prisma.boards.findUnique({
            where: { id: boardId }
        });
       
        // Fetch notes för en viss board
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


// POST en ny note för en specifik board
router.post('/:boardId/notes', authorize, async (req, res) => {
    const { boardId } = req.params; 
    const { note, color, positionT, positionL } = req.body; 

    try {
        const board = await prisma.boards.findUnique({
            where: { id: boardId },
        });

        if (!board) {
            return res.status(404).send({ msg: "Board not found" });
        }

        const newNote = await prisma.notes.create({
            data: {
                note: note,
                authorId: req.userData.sub, // JWT ID
                boardId: boardId,
                color: color,
                positionT: positionT, 
                positionL: positionL,

            },
        });

        res.status(201).send({ msg: "New note created: ", note: newNote });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ msg: "Error creating note" });
    }
});

// PUT note när modifierad 
router.put('/:boardId/:noteId', authorize, async  (req, res) =>{
    const { boardId } = req.params;
    const { noteId } = req.params;
    const { note, color, positionT, positionL } = req.body;
    
    try {
        const board = await prisma.boards.findUnique({
            where: { id: boardId },
        });

        if (!board) {
            return res.status(404).send({ msg: "Board not found" });
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

        res.status(201).send({ msg: "Note updated: ", note: updateNote });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ msg: "Error updatning note" });
    }
 })

router.delete('/:boardId/:noteId', authorize, async  (req, res) =>{
   const { boardId, noteId } = req.params; 

    try {
        const board = await prisma.boards.findUnique({
            where: { id: boardId },
        });

        if (!board) {
            return res.status(404).send({ msg: "Board not found" });
        }

        // letar upp id:n för noten som ska raderas 
        const deleteNote = await prisma.notes.delete({
            where: {
                id: noteId,
            },
        });

        res.status(200).send({ msg: "Note deleted: ", note: deleteNote });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ msg: "Error deleting note" });
    }
})


module.exports = router