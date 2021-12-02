import UserController from '../controllers/UserController';
import express from "express";
import { UserModel } from "../models/User";
import middleware from '../../app/middleware/middleware';

export function initUserRoutes(app: express.Application, passport: any) {
  console.log('- Initializing user routes');

  app.post('/api/login', (req: any, res: any) => {
    passport.authenticate('local', function(err, user, info) {
      console.log(err, user, info);
      if(err) {
        return res.json({
          message: err
        });
      }
      if( !user ) {
        return res.json({
          message: info
        })
      }
      return res.json(user);
    })(req, res);
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