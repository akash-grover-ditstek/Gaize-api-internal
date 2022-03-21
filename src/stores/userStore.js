import mongoose from 'mongoose';
import UserMongo from '../models/User.js';

export const UserSchema = new mongoose.Schema(UserMongo);
export const User = mongoose.model('User', UserSchema);

export default class UserStore {
  async createUser(attributes) {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      userName,
      createdAt
    } = attributes;


    const newUserFields = {
      firstName,
      lastName,
      email,
      phoneNumber,
      userName,
      createdAt
    };

    let savedUser;
    const user = new User(newUserFields);
    try {
      savedUser = await user.save();
    } catch (e) {
      console.error(e);
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    return savedUser;

  }

  async updateUser(userName, attributes){
    let user;
    try {
      user = await User.findOneAndUpdate({ userName: userName }, attributes, { new: true });
      if(!user){
        return Promise.reject(new UserStore.NOT_FOUND());
      }
    } catch (e) {
      console.error(e);
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
    return user;
  }


  async getUser(attributes){
    let user;
    try {
      user = await User.findOne(attributes);
      if(!user){
        return Promise.reject(new UserStore.NOT_FOUND());
      }
    } catch (e) {
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
    return user;
  }

}

UserStore.OPERATION_UNSUCCESSFUL = class extends Error {
  constructor() {
    super('An error occured while processing the request.');
  }
};
UserStore.NOT_FOUND = class extends Error {
  constructor() {
    super('User Not Found');
  }
};