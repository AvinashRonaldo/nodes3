const express = require('express');
const cors = require('cors');
const fs = require('fs')
const path = require('path');
const morgan = require('morgan');
const multer = require('multer');
require('dotenv').config();
const File = require('./models/file');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const app = express()

const port = process.env.PORT;
const rootDirectory = process.env.ROOT_DIR;

app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.use(express.urlencoded({extended:true}));

app.get("/",(req,res) => {
    res.json({message:"Welcome to nodes3"});
});

app.use(fileRoutes);
app.use(userRoutes);

app.listen(port,() => {
    if(!fs.existsSync(rootDirectory)){
        fs.mkdirSync(rootDirectory);
    }
    console.log("Server started on port 3000!")
})