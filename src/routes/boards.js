const express = require('express')
const router = express.Router()
const{ PrismaClient } = require('@prisma/client')
const authorize = require('../middleware/auth')
const prisma = new PrismaClient() 


// Denna endpoint returnerar BOARDS
// en del users har access till vissa boards
// Dessa accessright hämtas från DB


router.get('/', authorize, async (req,res) => {

    try{
        console.log("boards / GET")
        const boards = await prisma.boards.findMany({
            where: {
                authorId: req.userData.sub
              }
        })
        res.status(200).send({msg: `Boards for user ${req.userData.boards} ` , boards: boards})

    } catch (error) {
        console.log(error)
        res.status(500).send({msg: "ERROR"})
    }   
})

// har ej uppdareat prisma