require('dotenv').config()
const jwt = require('jsonwebtoken')
// Har använt lektionsexemplet som authorization metoden. 
module.exports = (req, res, next) =>{
    try{
        const authHeader = req.headers['authorization']
        console.log(`Authorize jwt: ${authHeader}`)
        const token = authHeader?.split(' ')[1]

        // Verifiera JWTn
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        console.log(`Token authorized for user ${userData.sub} ${userData.name}`)
        
        req.userData = userData // Injicerar userData i request-objektet
        next()

    } catch (error){
        console.log(error.message)
        res.status(401).send({
            message: "Authorization error",
            error: error.message
        })
    }

    
}