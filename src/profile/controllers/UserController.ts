import { User } from '../models/User';

export default class UserController {
  public create(user) {
    return user
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