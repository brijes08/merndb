const jwt = require('jsonwebtoken')
const User = require('../models/userSchema')

const authenticate = async (req, res, next) => {
    try {
        const headersArray  = req.rawHeaders;

        const authIndex = headersArray.indexOf('Authorization');
        const token = authIndex !== -1 ? headersArray[authIndex + 1] : null;

        console.log('token:', token);

        // console.log(req);
        // console.log(token, '0');

        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
        const rootUser = await User.findOne({_id: verifyToken._id, "tokens.token": token});

        req.user = verifyToken.user;
        console.log(rootUser, '1');

        if (!rootUser) {
            throw new Error('User Not Founds');
        } else {
            req.token = token;
            req.rootUser = rootUser;
            req.userID = rootUser._id;
            console.log(req.rootUser, '2');
            next();
        }
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = authenticate;
