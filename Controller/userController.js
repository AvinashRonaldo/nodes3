const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user');

const hashPassword = async(password) => {
    const pass = await bcrypt.hash(password,10);
    return pass;
}

const decrypt = async(password,hashedPassword) => {
    const match = await bcrypt.compare(password,hashedPassword) 
    return match;
}

//Register User
const register  = async(req,res) => {
    try{
        const {username,password,email,phone} = req.body;
        const curUser = await User.findOne({username :username});
        if(curUser){
            return res.status(404).json({error:'User Name already exists'});
        }
        const hashedPass = await hashPassword(password); 
        const user = await User.create({username,password:hashedPass,email,phone});
        return res.status(200).json({message:'User created successfully'})
        }
    catch(err){
            console.log(err);
        }
}

//Login user
const login = async(req,res)=> {
    try{
        const {username,password} = req.body;
        const user = await User.findOne({username :username});
        if(!user){
            return res.json({message:'User does not exists'});
        }
        const match = await decrypt(password,user.password);
        if(!match){
            return res.status(404).json({message:'Bad Credentials'});
        }
        else {
            const payload = {user};
            const token = jwt.sign(payload,process.env.JWT_SECRET);
            return res.json(token);
        }
    }catch(err){
        console.log(err);
    }
}

module.exports = {login,register};