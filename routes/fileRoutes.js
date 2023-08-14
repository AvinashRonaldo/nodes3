const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const File = require('../models/file');
const upload = require('../config/multer_init');
const { verifyToken } = require('../middleware/authMiddleware');
require('dotenv').config();


const rootDirectory = process.env.ROOT_DIR;
const deleteFolderRecursive =  async(directoryPath) => {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach(async(file, index) => {
          const curPath = path.join(directoryPath, file);
          console.log(curPath);
          if (fs.lstatSync(curPath).isDirectory()) {
           // recurse
            deleteFolderRecursive(curPath);
          } else {
            // delete file
            fs.unlinkSync(curPath);
            const file = await File.findOne({file_path:curPath});
            console.log(file);
            await file.remove();
          }
        });
        fs.rmdirSync(directoryPath);
      }
    };

router.get("/buckets/all",verifyToken,async(req,res)=> {
    try{
        const userName = req.user.username;
        const dirPath = `${rootDirectory}/${userName}`;
        if(!fs.existsSync(dirPath)){
            return res.json({message:"No Buckets available,create one"});
        }
        fs.readdir(dirPath,(err,data) => {
            if(err){
                console.log(err);
                return res.json({error:"Error while reading directory "+err});
            }
            const buckets = data.filter(file => {
                const filePath = path.join(dirPath, file);
                return fs.statSync(filePath).isDirectory();
            });
            return res.json({message:buckets});
        });
    }catch(err){
        console.log(err);
    }
})

router.get("/bucket/:bucketName/files",verifyToken,async(req,res) => {
    try{
        const userName = req.user.username;
        const {bucketName} = req.params;
        const dirPath = `${rootDirectory}/${userName}/${bucketName}`;
        if(!fs.existsSync(dirPath)){
            return res.json({message:"No Bucket exists with that name"});
        }
        fs.readdir(dirPath,(err,data) => {
            if(err){
                console.log(err);
                return res.json({error:"Error while reading directory "+err});
            }
            const files = data.filter(file => {
                const filePath = path.join(dirPath, file);
                return fs.statSync(filePath).isFile();
            });
            return res.json({message:files});
        });
    }catch(err){
        console.log(err);
    }
})

router.delete("/bucket/:bucketName/file/:fileName",verifyToken,async(req,res) => {
    try{
        const {bucketName,fileName} = req.params;
        const path = `${rootDirectory}/${req.user.username}/${bucketName}/${fileName}`;
        console.log(path);
        if(!fs.existsSync(path)){
            return res.json({error:'File do not exists'});
        }
        fs.unlink(path,(err) =>{
            if(err){
                console.log("error occcured while removing file");
            }
        })
        await File.deleteOne({file_name:fileName});
        return res.status(200).json({message:'File deleted successfully'});
    } catch(err){
        console.log(err);
    }
})

router.delete("/bucket/:bucketName",verifyToken,async(req,res) => {
    try{
        const userName = req.user.username;
        const {bucketName} = req.params;
        const path = `${rootDirectory}/${userName}/${bucketName}`;
        if(!fs.existsSync(path)){
            return res.status(401).json({error:"Bucket does not exists"});
        }
        await deleteFolderRecursive(path);
        return res.status(200).json({message:"Bucket deleted successfully"});
    }catch(err){
        console.log(err);
    }
})


router.post("/bucket/create/:bucketName",verifyToken,async(req,res) => {
    try{
        const {bucketName} = req.params;
        if (!bucketName) {
            return res.json({ status: false, message: "Bucket Name is Mandatory" });
        }
        const match = await File.findOne({bucket_name:bucketName});
        if(match){
            return res.status(401).json({error:"Bucket Name already exists!Choose another bucket name"});
        }
        const userName = req.user.username;
        const folderPath = `${rootDirectory}/${userName}/${bucketName}`;
        if(fs.existsSync(folderPath)){
            return res.status(401).json({error:"Bucket Name already exists!Choose another bucket name"});
        }
        fs.mkdirSync(folderPath,{recursive:true});
        return res.json({message:"Bucket created successfully!"});
    } catch(err){
        console.log(err);
    }
});

router.post("/bucket/:bucketName/upload",verifyToken,upload.single('file'),async(req,res) => {
    try{
        const bucketName = req.params.bucketName;
        const path = `${rootDirectory}/${req.user.username}/${bucketName}`
        if(!fs.existsSync(path)){
            return res.status(400).json({error:'Bucket do not exists'});
        }
        const file = new File({
            file_name:req.file.originalname,
            uploaded_by:req.user.username,
            bucket_name:bucketName,
            file_path:req.file.path,
            file_type:req.file.mimetype
        });
        await file.save();
        res.json({message:"Files uploaded successfully!"});
    }catch(err){
        console.log(err);
    }
})

router.post("/bucket/:bucketName/upload/files",verifyToken,upload.array('files'),async(req,res) => {
    try{
        const bucketName = req.params.bucketName;
        const userName = req.user.username;
        const path = `${rootDirectory}/${userName}/${bucketName}`
        if(!fs.existsSync(path)){
            return res.status(400).json({error:'Bucket do not exists'});
        }
        console.log(req.files);
        const files  = req.files;
        files.forEach(async(file) => {
           let newFile =  new File({
            file_name:file.originalname,
            uploaded_by:userName,
            bucket_name:bucketName,
            file_path:file.path,
            file_type:file.mimetype
            });
            await newFile.save();
        })
        res.json({message:"Files uploaded successfully!"});
    }catch(err){
        console.log(err);
    }
})

module.exports = router;
