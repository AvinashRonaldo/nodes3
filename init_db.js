const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.DB_URI;

const connection = mongoose.createConnection(uri);

connection.on('open',(err) => {
    if(err){console.log(err);}
    console.log("Connected to database");
})

module.exports=connection;