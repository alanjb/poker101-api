import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import GameController from '../game/GameController';
import {Game} from "../game/models/Game";
import { Card } from "../game/models/Card";
import { CARD_REGEX, errorFunction } from './utils';
import { gameValidationMiddleware } from '../game/validation/GameValidation';

// Creates and configures an Node web server. Prevents sub-typing of this class.
class App {

  // refs to Express instance and game controller objects
  private static app: express.Application;
  private static gameController = new GameController();

  //Run configuration methods on the Express instance by building 
  public static buildApp() {
    console.log("Starting build...");

    this.initExpress();
    this.initMiddleware();
    this.initDatabase();
    this.initRoutes();

    return this.start();
  }

  private static initExpress() {
    console.log("Creating node application...");
    this.app = express();
  }

  // Configure Express middleware.
  private static initMiddleware(): void {
    console.log("Initializing application middleware...");

    if (this.app) {
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
  }

  private static initDatabase() {
    console.log("Initializing database...");

    const mongoDB = process.env.CONNECTION_STRING;
    const mongoose = require('mongoose');
    const db = mongoose.connection;
    
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
    console.log("Initializing application routes...");

    const { app, gameController } = this;

    app.get('/', (req, res) => {
      res.send('swe681-game.net')
    });

    app.get('/api', (req, res) => {
      res.send('swe681-game.net/api')
    });

    app.post("/api/game/create", gameValidationMiddleware, async (req: any, res: any) => {
      try {
        const newGame = new Game({
          players: req.body.game.players,
          requiredPointsPerPlayer: req.body.game.requiredPointsPerPlayer,
          antiAmount: req.body.game.antiAmount
        });

        //randomized deck, set other parameters here
        
        return await gameController
          .create(newGame)
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

    app.delete("/api/player/deck/discard", async (req: any, res: any) => {
      const cardsToDiscard = req.body;

      await cardsToDiscard
        .forEach(card => {
          const cardType = card.face + ' of ' + card.suit;

          if (cardType.match(CARD_REGEX)) {
        
            const cardToDiscard = new Card({id: card.id, face: card.face, suit: card.suit});

            gameController
              .discard(cardToDiscard)
              .then(response => {
                // console.log(response, 'discarded...')
              })
              .catch(error => {
                console.log(error)
              });
          }
          else {
            console.log('ERROR! Regex match failed.')
          }
        })
    });
  }

  private static start() {
    if (this.app) {
      return this.app;
    }
  }
}

export default App;