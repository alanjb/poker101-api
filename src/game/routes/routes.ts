import { errorFunction, CARD_REGEX } from "../../app/config/utils";
import { Card } from "../models/Card";
import { Game } from "../models/Game";
import GameController from '../controllers/GameController';
import { gameValidationMiddleware } from "../validation/GameValidation";
import express from "express";
import middleware from "../../app/middleware/middleware";

export function initGameRoutes(app: express.Application) {
  console.log('- Initializing game routes');

  app.get('/api/game/game', middleware, (req: any, res: any) => {
    
  });

  app.post('/api/game/create', gameValidationMiddleware, (req: any, res: any) => {
    const gameController = new GameController();

    try {
      const newGame = new Game({
        players: req.body.game.players,
        requiredPointsPerPlayer: req.body.game.requiredPointsPerPlayer,
        anteAmount: req.body.game.anteAmount
      });
  
      //randomized deck, set other parameters here
      
      return gameController
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
  
  app.delete('/api/game/discard', (req: any, res: any) => {
  
    try {
    } catch (error) { }
  
    const cardsToDiscard = req.body;
    const gameController = new GameController();
  
    cardsToDiscard
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