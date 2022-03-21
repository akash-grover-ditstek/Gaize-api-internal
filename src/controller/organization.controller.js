// const AWS = require('aws-sdk');
import AWS from 'aws-sdk'
import * as Time from '../utils/time.js'
import Joi from 'joi';
import Stripe from 'stripe';
import StatusCodes from '../utils/StatusCodes.js';
import ApiResponse from '../utils/apiResponse.js';
import OrganizationStore from '../stores/organizaionStore.js';
import { nanoid } from 'nanoid';
import controller from './controller.js';
import {createFolderOnucket} from './bucket.controller.js'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Storage = new OrganizationStore();

export default class organizationController {

  async createOrganization(request, res, returnResponse = false) {
    const {
      error,
      value
    } = Joi.object().keys({
      organizationName: Joi.string().required(),
      userId: Joi.string().required(),
    }).validate(request.body);

    if (error) {
      return ApiResponse.error(res, StatusCodes.BAD_REQUEST, error);
    }
    const {
      organizationName,
      userId,
      createdAt
    } = value;
    const regex = /[^a-zA-Z0-9]/g;
    let bucketPrefix = `${organizationName.replace(regex, "")}-${nanoid(6)}`
    const attributes = {
      organizationName,
      userId,
      bucketPrefix,
      createdAt: Time.now(),
    };
    let organization;
    try {
      organization = await Storage.createOrganization(attributes);
      if(organization){
        await createFolderOnucket(bucketPrefix);
      }
    } catch (e) {
      return ApiResponse.error(res, StatusCodes.BAD_REQUEST, e);
    }
    if (returnResponse) {
      return organization;
    }
    return ApiResponse.success(res, {
      user
    });
  }


  async saveSubscriptionId(attribute) {

    const { organizationId, subscriptionId } = attribute;
    let organization;
    try {
      organization = await Storage.saveSubscriptionId(organizationId, { subscriptionId });
      if (!organization) {
        return Promise.reject(new OrganizationStore.NOT_FOUND());
      }
    } catch (e) {
      console.error(e);
      return Promise.reject(new OrganizationStore.OPERATION_UNSUCCESSFUL());
    }
    return organization;

  }



  async getOrganization(attributes) {
    let organization;
    try {
      organization = await Storage.getOrganization(attributes);
    } catch (error) {
      throw error
    }
    return organization;
  }

  async getBucketPrefix(req, res, next, returnResponse = false) {
    let userData
    try {
      userData = await controller.user.getUserData(req, res, next, true)
    } catch (error) {
      throw error
    }

    if (!userData.organization) {
      throw new Error("No User info found")
    }

    if (returnResponse) {
      return userData.organization.bucketPrefix
    }

    return ApiResponse.success(res, {
      prefix: userData.organization.bucketPrefix
    });
  }
}

OrganizationStore.OPERATION_UNSUCCESSFUL = class extends Error {
  constructor() {
    super('An error occured while processing the request.');
  }
};
OrganizationStore.NOT_FOUND = class extends Error {
  constructor() {
    super('Record Not Found');
  }
};