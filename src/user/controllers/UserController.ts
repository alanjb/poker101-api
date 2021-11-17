import { User } from '../models/User';

export default class UserController {
  public getUser(email) {
    return User
      .findOne({email})
      .then((response) => {
        return response;
      })
      .catch((response) => {
        return response;
      });
  }

  public create(user) {
    return User
      .create(user)
      .then((response) => {
        console.log("Success! User created.");
        return response;
      })
      .catch((response) => {
        console.log("Error! User could not be created.");
        return response;
      }) 
  }
}