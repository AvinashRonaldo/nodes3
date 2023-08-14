const mongoose = require('mongoose');
const connection = require('../init_db');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    }
});

const User =  connection.model('User',userSchema);

module.exports = User;
