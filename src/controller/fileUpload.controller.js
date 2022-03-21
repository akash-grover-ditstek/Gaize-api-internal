import 'dotenv/config';
import AWS from 'aws-sdk'
import multer from 'multer';
import multerS3  from 'multer-s3'

let folderName = '';
const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_REMOTE_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_REMOTE_SECRET_ACCESS_KEY,
    Bucket: process.env.AWS_BUCKET
});


const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}


const multerS3Config = multerS3({

    s3: s3Config,
    bucket: process.env.AWS_BUCKET,
    metadata: function (req, file, cb) {
        cb(null, {
            fieldName: file.fieldname
        });
    },
    key: function (req, file, cb) {
        //   console.log(req, file, cb);
        // console.log(file)
        cb(null, 'test/' + new Date().toISOString() + '-' + file.originalname)
    }
});

export const fileUpload = multer({
    storage: multerS3Config,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // we are allowing only 5 MB files
    }
});


export function upload(req, res) {
   // console.log(req.body.username);
    folderName = req.body.username;
    try {
        res.send(req.file);
    } catch (err) {
        res.status(400).send({
            error: error.message
        })
    }
}


export function createFolder(){
    var params = {
        Bucket: process.env.AWS_BUCKET, 
        Key: "omkar/", 
        ServerSideEncryption: "AES256", 
        StorageClass: "STANDARD_IA"
       };
       s3.putObject(params, function(err, data) {
         if (err) console.log(err, err.stack); // an error occurred
         else     console.log(data);           // successful response
       });
}

// exports.profileImage = upload; 