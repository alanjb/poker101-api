import { errorFunction } from "../../app/config/utils";
import UserController from '../controllers/UserController';
import express from "express";
import { User } from "../models/User";
import middleware from '../../app/middleware/middleware';

export function initProfileRoutes(app: express.Application) {
  console.log('- Initializing profile routes');

  app.get('/api/profile/user', middleware, (req: any, res: any) => {
    try {
      const userController = new UserController();
      const newUser = new User({
        email: req.body.email
      });
      
      return userController
        .getUser(newUser)
        .then((game) => {
          console.log("Success: Created new game...", game);
          res.json({
            isGameCreated: true,
            game: game
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
      
        return res.json(errorFunction(true, "Error Creating User"));
    }
  });

  app.post('/api/profile/create', middleware, (req: any, res: any) => {
    try {
      const userController = new UserController();
      const newUser = new User({
        email: req.body.email
      });
      
      return userController
        .create(newUser)
        .then((game) => {
          console.log("Success: Created new game...", game);
          res.json({
            isGameCreated: true,
            game: game
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
      
        return res.json(errorFunction(true, "Error Creating User"));
    }
  });
}