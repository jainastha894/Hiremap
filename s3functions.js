import {S3Client} from "@aws-sdk/client-s3";
import { PutObjectCommand, GetObjectCommand , DeleteObjectCommand,ListObjectsV2Command} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';
dotenv.config();


// Create an S3 client
const client= new S3Client({
    region: "ap-south-1",
    credentials:{
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
});

async function deleteFile(bucketName, objectKey){
    try{
        const command=new DeleteObjectCommand({
            Bucket:bucketName,
            Key:objectKey
        });
        await client.send(command);
        console.log("File Deleted Successfully"); 
    }
    catch(err){
        console.log("Error in deleting file",err);
    }
}

//Function to list objects in a bucket
async function listObjects(){
    let totalObjects=0;
    let totalSize=0;
    try{
        const command= new ListObjectsV2Command({Bucket:"hiremapresume", Prefix:"resume/"});
        const response= await client.send(command);
        // console.log("List Objects Response:", response);
        // console.log("response.contents:", response.Contents);
        if (response.Contents) {
            response.Contents.forEach((obj)=> {
                totalSize += obj.Size;     // file size in bytes
                totalObjects++;            // count files
            });
        }
        return { objects:response.Contents, totalObjects:totalObjects, totalSize:totalSize };
    }

    catch(err){

        console.log("Error in listing objects",err);
    }
}

// Function to upload a file
async function uploadFile(key){
    try{
        console.log("Uploading file with key:", key);
        const command=new PutObjectCommand({
            Bucket:"hiremapresume",
            Key:key,
            ContentType: "application/octet-stream"
        });
        const url= await getSignedUrl(client, command);
        return url;
    }

    catch(err){
        console.log("Error in uploading file",err);
    }
}

//Function to generate a presigned URL for downloading an object
async function generatePresignedUrl(objectKeys){
    try{
        if (!Array.isArray(objectKeys)) {
            objectKeys = [objectKeys]; // convert single key to array
        }
        const result=await Promise.all(
            objectKeys.map(async(key)=>{
            const command=new GetObjectCommand({
            Bucket:"hiremapresume",
            Key:key
        });
        const url= await getSignedUrl(client,command);
        console.log("the function generatePresignedUrl key and url:",key,url);
        return {key, url};
            })
        );
        return result;
        
    }
    
    catch(err){
        console.log("Error in generating presigned URL",err);
    }
}

export {generatePresignedUrl, uploadFile, deleteFile, listObjects};