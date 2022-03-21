// require('dotenv').config();
import 'dotenv/config'
import Joi from 'joi';
import StatusCodes from '../utils/StatusCodes.js';
import ApiResponse from '../utils/apiResponse.js';
import { nanoid } from 'nanoid'
import controller from './controller.js';

import AWS from 'aws-sdk'


const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_REMOTE_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_REMOTE_SECRET_ACCESS_KEY,
    signatureVersion: process.env.AWS_SIGNATURE_VERSION,
    region: process.env.AWS_REMOTE_REGION,
    Bucket: process.env.AWS_BUCKET
});


export async function createFolderOnucket(attribute) {
    var params = {
        Bucket: process.env.AWS_BUCKET,
        Key: attribute+'/',
        Body:""
    };

    s3Config.upload(params, function (err, data) {
        if (err) {
            throw new Error(err);
        } else {
            return data;
        }

    });
}


async function checkPrefix(prefix, userName) {
    const url = prefix.split("/")[0];
    if (url == userName) {
        return true;
    }
    return false;
}


export async function getData(req, res, next) {

    const {
        userName
    } = req;

    let results = [];
    let folders = [];

    let prefix = req.body.prefix;
    let bucketPrefix = userName
    try {
        bucketPrefix = await controller.organization.getBucketPrefix(req, res, next, true)
    } catch (error) {
        console.log(error)
        return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
    }


    let finalPrefix;
    const url = await checkPrefix(prefix, bucketPrefix);
    if (!url) {
        finalPrefix = bucketPrefix + '/';
    } else {
        finalPrefix = prefix;
    }

    if (!finalPrefix) {
        return ApiResponse.error(res, StatusCodes.BAD_REQUEST, "Not Found");
    }

    try {
        var params = {
            Bucket: process.env.AWS_BUCKET,
            Delimiter: '/',
            Prefix: finalPrefix
        };
        s3Config.listObjects(params, function (err, data) {
            if (err) {
                return res.status(400).send({
                    err
                })
            }
            const contents = data.Contents;

            folders = data.CommonPrefixes.map(item => ({
                folder: item.Prefix
            }))
            contents.forEach((element, index) => {
                let isFirstFolder = '';
                let firstItem = contents[0]
                if (firstItem.Size == 0) {
                    isFirstFolder = firstItem.Key
                }
                var obj = {};
                obj.filename = element.Key.replace(isFirstFolder, '');
                obj.filePath = element.Key;
                obj.lastModified = element.LastModified; //Size
                obj.size = formatBytes(element.Size); //Size
                results.push(obj);
            });
            res.send({
                results,
                folders
            })
        });
    } catch (err) {
        res.status(400).send({
            error: err.message
        })
    }
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function viewFile(req, res) {
    const {
        error,
        value
      } = Joi.object().keys({
        filename: Joi.string().required(),
      }).validate(req.body);
      const {
        filename
      } = value;

      if (error) {
        return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
      }

    try {
        const key = filename;
        var params = {
            Bucket: process.env.AWS_BUCKET,
            Key: key,
            Expires: parseInt(process.env.AWS_BUCKET_FILE_URL_TIME)
        };
        var url = s3Config.getSignedUrl('getObject', params);
        res.send(url);
    } catch (err) {
        res.status(400).send({
            error: err.message
        })
    }

}