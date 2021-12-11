import UserController from '../controllers/UserController';
import { UserModel } from "../models/User";
import bcrypt from 'bcryptjs';
import { errorFunction } from '../../app/config/utils';

export function initUserRoutes(app, passport) {
  console.log('- Initializing user routes');

  app.post("/api/user/login", (req, res, next) => {
    const { username, password } = req.body;

    console.log(username)
    console.log(password)

    passport.authenticate("local", (err, user, info) => {
      try {
        if (err) throw err;

        if (!user) {
          console.log("Error: User does not exist");
          return res.json(errorFunction(true, "Error: Invalid username or password"));
        }

        if (user) {
          console.log('Found user...');

          req.logIn(user, (err) => {
            console.log('logging in user: ' + user);
            if (err) throw err;
            
            return res.json({
              user: user
            });
          });
        }
      }
      catch (error) {
        console.log('Error: There was an issue during user login \n\n ' + error);
        return res.json(errorFunction(true, "Error: There was an issue during user login"));
      }
    })(req, res, next);
  });

  app.post('/api/user/signup', (req: any, res: any) => {
    const { email, username, password } = req.body.user;

    UserModel.findOne({ email: email, username: username }, async (error, doc) => {
      try {
        if (error) {
          throw error;
        }

        console.log(doc)
  
        if (doc) {
          console.log("Error: User already exists");
          return res.json(errorFunction(true, "Error: User with this email or username already exists"));
        }
  
        if (!doc) {
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = new UserModel({
            email: email,
            username: username,
            password: hashedPassword,
          });

          const newlyCreatedUser = await newUser.save();

          console.log('User has been created')

          return res.json({
            user: newlyCreatedUser
          })
        }
      }
      catch (error) {
        console.log('Error: There was an issue signing up user \n\n ' + error);
        return res.json(errorFunction(true, "Error: User with this email or username already exists"));
      }
    });
  });

  app.get('/api/user/user', (req: any, res: any) => {
    try {
      const userController = new UserController();
      
      return userController
        .getByEmail(req.query.email)
        .then((user) => {
          //do instanceof here?
          if (!user) {
            console.log("User not found, signing user up");
            res.json({
              user: user
            })
          } else {
            console.log("User found");
            res.json({
              user: user
            })
          }
        })
        .catch((error) => {
          console.log("Error: Failed to get user", error);
          res.status(403);
        });
    } catch (error) {
      res.status(403);
    }
  });

  app.post('/api/user/user', (req: any, res: any) => {
    try {
      const userController = new UserController();

      const newUser = new UserModel({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        points: 1000
      });
      
      return userController
        .create(newUser)
        .then((user) => {
          console.log("Success: Created new game...", user);
          res.json({
            user: user
          })
        })
        .catch((error) => {
          console.log("Error: Failed to create game...", error);
          res.json({
            isGameCreated: false
          })
        });
    } catch (error) {
      res.status(403);      
    }
  });
}