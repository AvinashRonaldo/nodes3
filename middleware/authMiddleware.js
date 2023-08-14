const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = async(req,res,next) => {
    const secret = process.env.JWT_SECRET
    const token = req.headers['authorization'].split(" ")[1];
    if(!token){
        return res.status(400).json({message : "No token found!"});
    }
    else{
        const decoded = jwt.verify(token,secret);
        req.user = decoded.user;
        next();
    }
}

module.exports = {verifyToken};