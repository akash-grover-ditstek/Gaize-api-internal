import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken'
import AWS from 'aws-sdk'
// const { verifierFactory, errors: { JwtVerificationError, JwksNoMatchingKeyError }, } = require('@southlane/cognito-jwt-verifier');
import {verifierFactory, errors} from '@southlane/cognito-jwt-verifier'
AWS.config.update({
  region: process.env.AWS_USER_POOL_REGION
});

const publicUrl = ['/user/register', '/user/updateUser', '/stripe/create-customer', '/user/getUserByEmail'];

export const validateToken = async (req, res, next) => {

  if (publicUrl.includes(req.url)) {
    next();
  } else {
    try {
      let token = '';
      if (req.headers.authorization) {
        token = req.headers.authorization.replace("Bearer", "").trim();
      }
      if (!token) {
        return res.json({
          status: '400',
          message: 'Invalid Request'
        });
      }

      const verifier = verifierFactory({
        region: process.env.AWS_USER_POOL_REGION,
        userPoolId: process.env.AWS_USER_POOL_ID,
        tokenType: process.env.AWS_TOKEN_USE,
        appClientId: process.env.AWS_CLIENT_ID,
      });
      const payload = await verifier.verify(token)
      req.userName = payload.username;
      next();
    } catch (e) {

      return res.json({
        status: '400',
        message: e.message
      });
    }
  }
}