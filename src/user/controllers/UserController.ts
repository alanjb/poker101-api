import { UserModel } from '../models/User';

export default class UserController {
  public async getById(id) {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      return error;
    }
  }

  public async getByEmail(email) {
    return UserModel
      .findOne({email})
      .then((response) => {
        return response;
      })
      .catch((response) => {
        return response;
      });
  }

  public async create(user) {
    try {
      return await UserModel.create(user);
    } catch (error) {
      return error;
    }
  }
}