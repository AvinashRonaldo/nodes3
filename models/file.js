const mongoose = require('mongoose');
const connection = require('../init_db');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    file_name:{
        type:String,
        required:true
    },
    uploaded_by:{
        type:String,
        required:true
    },
    bucket_name:{
        type:String,
        required:true
    },
    file_path:{
        type:String,
        required:true
    },
    file_type:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const File = connection.model('file',fileSchema);
module.exports = File;