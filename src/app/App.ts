import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import { initGameRoutes } from '../game/routes/routes';
import { initProfileRoutes } from '../profile/routes/routes';
import middleware from './middleware/middleware';

// Creates and configures an Node web server. Prevents sub-typing of this class.
class App {

  // ref to Express instance 
  private static app: express.Application;

  //Run configuration methods 
  public static buildApp() {
    console.log("Starting build...");

    this.initExpress();
    this.initMiddleware();
    this.initDatabase();
    this.initRoutes();

    return this.start();
  }

  private static initExpress() {
    console.log("Creating node server...");
    this.app = express();
  }

  // Configure Express middleware.
  private static initMiddleware(): void {
    console.log("Initializing server middleware...");

    if (!this.app) {
      //log server creation error
    }

    this.app.use(logger('dev'));
    this.app.use(cors())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(express.json());
    this.app.use(function (req: any, res: any, next: any) {
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      next();
    });
  }

  private static initDatabase() {
    console.log("Initializing database...");

    const mongoDB = process.env.CONNECTION_STRING;
    const mongoose = require('mongoose');
    const db = mongoose.connection;

    if (!mongoDB) {
      //log m
      throw new Error(
        ".env is missing the definition of an AUTH0_AUDIENCE environmental variable"
    );
    }

    if (!mongoose) {
      //log m
      throw new Error(
        ".env is missing the definition of an AUTH0_AUDIENCE environmental variable"
      );
    }
    
    mongoose
      .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log("Successfully initialized database...running at " + mongoDB);
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));
      })
      .catch(error => {
        console.log("Error: " + error);
      })
  }

  private static initRoutes() {
    console.log("Initializing server routes...");

    const { app } = this;

    //test route
    app.get('/', middleware, (req, res) => {
      res.send('swe681-game.net')
    });

    initGameRoutes(app);
    initProfileRoutes(app);
  }

  private static start() {
    if (this.app) {
      return this.app;
    }
  }
}

export default App;