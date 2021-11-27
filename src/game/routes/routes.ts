import { errorFunction } from "../../app/config/utils";
import { Game, GameModel } from "../models/Game";
import { PlayerModel } from "../../player/models/Player";
import GameController from '../controllers/GameController';
import express from "express";
import UserController from "../../user/controllers/UserController";
import { shuffleDeck, updateGame } from '../utils/utils';
import PlayerController from "../../player/controllers/PlayerController";

export function initGameRoutes(app: express.Application) {
  console.log('- Initializing game routes');

  app.get('/api/game/game', async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.query.gameId;  
      const game = await gameController.get(gameId);
  
      return res.json({
        game: game
      });
      
    } catch (error) {
      return res.json(errorFunction(true, "Error: Could not start game: " + error));
    }
  });

  app.get('/api/game/games', (req: any, res: any) => {
    try {
      const gameController = new GameController();

      return gameController
        .getAll()
        .then((games) => {
          console.log("Successfully retrieved all games...");
          res.json({
            games: games
          })
        })
        .catch((error) => {
          console.log("Error: Failed to get games...", error);
          res.json({
            error: error
          })
        });
    } catch (error) {
      res.status(403);
      return res.json(errorFunction(true, "Error Creating User"));
    }
  });

  app.post('/api/game/create', async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const newGame = new GameModel({
        pot: req.body.game.anteAmount,
        roundCount: 1,
        status: 'starting',
        players: [],
        deck: [],
        requiredPointsPerPlayer: req.body.game.requiredPointsPerPlayer,
        anteAmount: req.body.game.anteAmount,
        bet: 0,
        roundOneMoves: [],
        roundTwoMoves: []
      });

      const createdGame = await gameController.create(newGame);

      if (createdGame instanceof GameModel) {
        return res.json({
          game: createdGame
        });
      }
      else {
        console.log("Error: database could not save game");
        return res.json(errorFunction(true, "Error: database could not save game"));
      }
    }
    catch (error) {
      return res.json(errorFunction(true, "Error Creating game: " + error));
    }
  });

  app.put('/api/game/add-player', async (req, res) => {
    try {
      const gameController = new GameController();
      const userController = new UserController();
      const gameId = req.body.params.gameId;
      const userId = req.body.params.userId;
      const game = await gameController.get(gameId);
      const user = await userController.getById(userId);

      //avoid adding player twice 
      if (game.players.length > 1) {
        game.players.forEach(player => {
          if (player.email === user.email) {
            console.log("Error: User is already added to this game");
            return res.json(errorFunction(true, "Error: Could not add player to game, player already added")); 
          }
        });
      }

      //check if user has minimum points for two rounds
      if (user.points < game.ante * 3) {
        console.log("Error: User doesn't have enough points");
        return res.json(errorFunction(true, "Error: You can't join the game because you're broke (you don't have enough points)")); 
      }

      const playerController = new PlayerController();
      const player = new PlayerModel({
        folded: false, 
        isDealer: false,
        points: user.points,
        hand: [],
        isTurn: false,
        email: user.email
      });

      const newPlayer = await playerController.create(player);

      if (newPlayer instanceof PlayerModel) {

        const update = {
          players: [
            ...game.players,
            newPlayer
          ]
        }

        const createdGame = await gameController.addPlayer(gameId, update);

        if (createdGame instanceof GameModel) {
          return res.json({
            game: createdGame
          });
        }
        else {
          console.log("Error: database could not add  player");
          return res.status(403);
        }
      }
      else {
        console.log('Error: cannot add player twice')
      }
    }
    catch (error) {
      return res.json(errorFunction(true, "Error: There was an issue adding player to game: " + error)); 
    }
  });

  app.put('/api/game/start', async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.params.gameId;
      const game = await gameController.get(gameId);
      const shuffledDeck = shuffleDeck();
      const updatedPlayersArray = game.players;
      updatedPlayersArray[1].isTurn = true;

      //get unshuffled deck from db, pass into shuffleDeck()

      //deal 5 cards to each player
      const update = {
        status: 'in progress',
        players: updatedPlayersArray,
        deck: shuffledDeck
      };

      const gameStarted = await gameController.start(gameId, update);

      if (gameStarted instanceof GameModel) {
        return res.json({
          game: gameStarted
        });
      }
      else {
        console.log("Error: database could not start game");
        return res.status(403);
      }
    } catch (error) {
      return res.json(errorFunction(true, "Error! There was an issue starting the game"));
    }
  });

  app.put('/api/game/check', async (req, res) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.params.gameId;
      const game = await gameController.get(gameId);
      const action = 'check';

      //players cannot check if a bet has been made
      if (game.bet !== 0) {
        return res.json(errorFunction(true, "Error: cannot check if bet has been placed")); 
      }

      const updatedPlayersArray = game.players;
      const updatedRoundArray = game.round === 1 ? game.roundOneMoves : game.roundTwoMoves;

      updateGame(updatedPlayersArray, updatedRoundArray, action);

      const update = {
        players: updatedPlayersArray,
        [game.round === 1 ? 'roundOneMoves' : 'roundTwoMoves']: updatedRoundArray
      };

      const updatedGame = await gameController.updateGame(gameId, update);

      console.log(updatedGame);

    } catch (error) {
      alert('Error! Could not process check')
    }
  });

  // app.delete('/api/game/discard', (req: any, res: any) => {
  
  //   try {
  //   } catch (error) { }
  
  //   const cardsToDiscard = req.body;
  //   const gameController = new GameController();
  
  //   cardsToDiscard
  //     .forEach(card => {
  //       const cardType = card.face + ' of ' + card.suit;
  
  //       if (cardType.match(CARD_REGEX)) {
      
  //         const cardToDiscard = new Card({id: card.id, face: card.face, suit: card.suit});
  
  //         gameController
  //           .discard(cardToDiscard)
  //           .then(response => {
  //             // console.log(response, 'discarded...')
  //           })
  //           .catch(error => {
  //             console.log(error)
  //           });
  //       }
  //       else {
  //         console.log('ERROR! Regex match failed.')
  //       }
  //     })
  // });
}