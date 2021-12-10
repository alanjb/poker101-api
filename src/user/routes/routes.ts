import UserController from '../controllers/UserController';
import express from "express";
import { UserModel } from "../models/User";
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

export function initUserRoutes(app: express.Application) {
  console.log('- Initializing user routes');

  app.post('/api/user/login', (req: any, res: any) => {
    const { username, password } = req.body.user;
    const user = {username: username, password: password};
    
    // const user = new UserModel({
    //   email: email,
    //   username: username,
    //   password: password
    // });
    
    passport.use(new LocalStrategy(
      function(username, password, done) {
        UserModel.findOne({ username: username }, function(err, user) {
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
          }
          if (!user.validPassword(password)) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, user);
        });
      }
    ));

  });

  app.post('/api/user/signup', (req: any, res: any) => {
    const { email, username, password } = req.body.user;
    // const user = {email, username, password};

    UserModel.findOne({ username: username}, async (err, doc) => {
      if (err) throw err;
      if (doc) res.send("User Already Exists");
      if (!doc) {
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = new UserModel({
            email: email,
            username: username,
            password: hashedPassword,
          });

          await newUser.save();
          res.send("User Created");
        }
        catch (error) {
          console.log(error)
        }
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