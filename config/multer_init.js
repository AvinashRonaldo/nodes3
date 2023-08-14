const fs = require('fs');
const path = require('path');
const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: function(req,file,cb){
        const folderName = req.user.username;
        const bucketName = req.params.bucketName;
        const path = `./Uploads/${folderName}/${bucketName}`;
        if(!fs.existsSync(path)){
            fs.mkdirSync(path,{recursive:true});
        }
        cb(null,path);
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
})

const upload = multer({storage:fileStorage});

module.exports = upload;