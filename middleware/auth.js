require("dotenv").config()
const jwt = require("jsonwebtoken")


module.exports = (req, res, next) => {
    try {
        const urlParams = new URLSearchParams(req.url.slice(1));
        console.log(`authorise jwt: ${authHeader}`)

        const token = urlParams.get('token')
        const userData = jwt.verify(token, process.env.JWT_SECRET)
        console.log(`Token authorised for user ${userData.sub} ${userData.name}`)

        req.userData = userData

        next()
    } catch (error) {
        console.log(error.message)
        res.status(401).send({msg: "Auth error"})
    }
}
