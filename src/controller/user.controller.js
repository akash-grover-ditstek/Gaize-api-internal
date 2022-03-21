import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
import Joi from 'joi';
import * as Time from '../utils/time.js'
import UserStore from '../stores/userStore.js';
import StatusCodes from '../utils/StatusCodes.js';
import ApiResponse from '../utils/apiResponse.js';
import controller from './controller.js'
import {
  createFolderOnucket
} from '../controller/bucket.controller.js';
const Storage = new UserStore();
export default class UserController {

  async register(request, res) {
    const {
      error,
      value
    } = Joi.object().keys({
      firstName: Joi.string().required(),
      userName: Joi.string().required(),
      lastName: Joi.any().required(),
      email: Joi.string().email().required(),
      phoneNumber: Joi.string().required(),
      organizationName: Joi.string().required(),
    }).validate(request.body);

    if (error) {
      return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
    }
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      userName,
      organizationName,
      createdAt
    } = value;

    const attributes = {
      firstName,
      lastName,
      email,
      phoneNumber,
      userName,
      createdAt: Time.now(),
    };
    let user
    let org
    try {
      user = await Storage.createUser(attributes);
      let orgAttributes = {
        organizationName,
        userId: user.id
      }
      const req = {
        body: orgAttributes
      }
      if (user) {
        org = await controller.organization.createOrganization(req, res, true);
      }
    } catch (e) {
      return ApiResponse.error(res, StatusCodes.BAD_REQUEST, e);
    }
    return ApiResponse.success(res, {
      user,
      org
    });
  }


  async updateUser(request, res) {
    const {
      error,
      value
    } = Joi.object().keys({
      userName: Joi.string().required(),
      emailVerified: Joi.boolean().required(),
    }).validate(request.body);

    if (error) {
      return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
    }
    const {
      userName,
      emailVerified
    } = value;

    let user
    try {
      user = await Storage.updateUser(userName, {
        emailVerified
      });
    } catch (e) {
      return ApiResponse.error(res, StatusCodes.BAD_REQUEST, e);
    }
    return ApiResponse.success(res, {
      user
    });

  }




  async getUserByEmail(req, res) {
    const {
      error,
      value
    } = Joi.object().keys({
      email: Joi.string().required(),
    }).validate(req.body);
    const {
      email
    } = value;

    if (error) {
      return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
    }
    let user
    try {
      user = await Storage.getUser({
        email: email
      });
    } catch (e) {
      return ApiResponse.error(res, StatusCodes.BAD_REQUEST, e);
    }
    return ApiResponse.success(res, {
      user
    });
  }



  async getUser(req, res) {
    let user
    try {
      user = await Storage.getUser({
        userName: req.userName
      });
    } catch (error) {
      throw error
    }
    return user
  }

  async getUserData(req, res, next, returnResponse = false) {

    const {
      userName
    } = req;

    //get Uer
    let user;
    let organization;
    try {
      user = await Storage.getUser({
        'userName': userName
      });
    } catch (error) {
      return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
    }

    if (user) {
      // Get Organization Data
      try {
        organization = await controller.organization.getOrganization({
          userId: user._id
        });
      } catch (error) {
        return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
      }
    }
    if (returnResponse) {
      return {
        user,
        organization
      }
    }
    return ApiResponse.success(res, {
      user,
      organization
    });

  }


}
