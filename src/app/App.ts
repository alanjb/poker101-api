import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { initGameRoutes } from '../game/routes/routes';
import { initUserRoutes } from '../user/routes/routes';

// Creates and configures an Node web server. Prevents sub-typing of this class.
class App {

  // ref to Express instance 
  private static app: express.Application;

  //Run configuration methods 
  public static async build(): Promise<express.Application> {
    console.log("Starting build...");

    try {
      //initExpress and initDatabase are independent 
      const [expressStarted, databaseStarted] = await Promise.all([
        this.initExpress(),
        this.initDatabase(),
      ]);
      
      if (!expressStarted) {
        throw new Error('Error: Express could not start')
      }

      const [middleware, routes] = await Promise.all([
        this.initMiddleware(),
        this.initRoutes()
      ]);

      return this.start();
    }
    catch (error) {
      console.log(error.message)
    }
  }

  private static initExpress(): Promise<boolean | Error> {
    console.log("Creating node server...");

    return new Promise((resolve, reject) => {
      this.app = express();

      if (!this.app) {
        reject(new Error('Error: Express failed to create app'));
      }
      else {
        resolve(true);
      }
    });
  }

  private static initMiddleware(): void {
    console.log("Initializing server middleware...");

    //helmet
    this.app.use(logger('dev'));
    this.app.use(cors({
      origin: "http://localhost:3000", // <-- location of the react app were connecting to
      credentials: true,
    }
    ));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(session({
      secret: 'secretCode',
      resave: true,
      saveUninitialized: true
    })); 
    this.app.use(cookieParser('secretCode'));
    this.app.use(function (req: any, res: any, next: any) {
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      next();
    });
    this.app.use(passport.initialize());
    this.app.use(passport.session());
    require("./security/index")(passport);
  }

  private static initDatabase(): Promise<boolean | Error> {
    console.log("Initializing database...");

    return new Promise((resolve, reject) => {
      try {
        const mongoDB = process.env.CONNECTION_STRING;
        const mongoose = require('mongoose');
        const db = mongoose.connection;

        mongoose
          .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
          .then(() => {
            console.log("Successfully initialized database...running at " + mongoDB);
            db.on('error', console.error.bind(console, 'MongoDB connection error: '));
            resolve(true);
          })
          .catch((error) => {
            reject(new Error('Database could not connect \n\n ' + error));
          });
      }
      catch (error) {
        reject(new Error('Error: ' + error));
      }
    });
  }

  private static initRoutes(): void {
    console.log("Initializing server routes...");

    const { app } = this;

    initGameRoutes(app);
    initUserRoutes(app, passport);
  }

  private static start(): express.Application {
    const { app } = this;

    return app;
  }
}

export default App;