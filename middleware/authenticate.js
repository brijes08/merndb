const jwt = require('jsonwebtoken')
const User = require('../models/userSchema')

const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.jwtoken
        console.log(token, '0')
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
        const rootUser = await User.findOne({_id:verifyToken._id, "tokens.token": token})
        console.log(rootUser, '1')
        if(!rootUser){
            throw new Error('User Not Found')
        } else {
            req.token = token
            req.rootUser = rootUser
            req.userID = rootUser._id
            next()
            console.log(req.rootUser, '2')
        }
    } catch (err) {
        res.status(400).send('Unauthorized:No token provided');
        console.log(err)
    }
}

module.exports = authenticate;