const express = require('express')
const router = express.Router()
const authorize = require('../middleware/auth')
const{ PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient() //instansierar objekt med new 

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// GET för att få min egen användares data (enligt jwt)
router.get('/profile', authorize, async (req,res) => {

    try{
        console.log("notes / GET")
        const user = await prisma.user.findUnique({
            where: {
                id: req.userData.sub
              }
        })
        res.status(200).send({msg: `Hello there ${user.name}`})

    } catch (error) {
        console.log(error)
        res.status(500).send({msg: "ERROR"})
    }   
})

router.post('/register', async (req, res) => {
    console.log(req.body)
    // https://www.npmjs.com/package/bcrypt    password,      salt-rounds 10
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    try {
        const newUser = await prisma.user.create({ // user.create då modellen i prisma heter så 
            data: { // id skapas automatiskt
                name: req.body.name,
                email: req.body.email,
                role: req.body.role,
                password: hashedPassword
            }
        })
        res.send({msg: "New user created!"})
    } catch (error) {
        console.log(error.message)
        res.status(500).send({msg: "ERROR"})
    }
    
})

router.post('/login', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { email: req.body.email}
    })

    if (user == null){
        console.log("BAD USERNAME")
        return res.status(401).send({ msg: "Authentcation failed" })
    }
    // Jämför det skriva med databasens lösen eller klartext med hashen. att skickade lösen matchar databsaens hash
    const match = await bcrypt.compare(req.body.password, user.password) 

    if (!match){
        console.log("BAD PASSWORD")
        return res.status(401).send({ msg: " Authentcation failed" })
        // return så att man hoppar ut ur funktionen
    }

    const token = await jwt.sign({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    }, process.env.JWT_SECRET, { expiresIn: '30d'})

    res.send({msg: "Login ok", jwt: token})
    res.redirect('users/profile')


})

module.exports = router