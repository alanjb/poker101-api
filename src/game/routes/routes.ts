import express from "express";
import { errorFunction } from "../../app/config/utils";
import { GameModel } from "../models/Game";
import { PlayerModel } from "../../player/models/Player";
import GameController from '../controllers/GameController';
import asyncHandler from "express-async-handler";
import UserController from "../../user/controllers/UserController";
import { shuffleDeck, updateGame } from '../utils/utils';
import PlayerController from "../../player/controllers/PlayerController";
import { UserModel } from "../../user/models/User";

export function initGameRoutes(app: express.Application) {
  console.log('- Initializing game routes');

  app.get('/api/game/game', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.query.gameId;
      
      console.log(gameId);

      const game = await gameController.get(gameId);

      res.json({
        game: game
      });
      
    }
    catch(error) {
      res.json(errorFunction(true, "Error: Could not start game: " + error));
    }
  }));

  app.get('/api/game/games',  asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const games = await gameController.getAll();

      console.log(games);

      res.json({
        games: games
      })

    }
    catch (error) {
      console.log("Error: Could not get games \n\n " + error);
      res.json(errorFunction(true, "Error: Could not get games \n\n " + error));
    }
  }));

  app.post('/api/game/create', asyncHandler(async (req: any, res: any) => {
    try {
      const userController = new UserController();
      const userResponse = await userController.getById(req.body.userId);

      if (!(userResponse instanceof UserModel)) {
        console.log("Error: database could not find user: " + userResponse);
        res.json(errorFunction(true, "Error: database could not find user: " + userResponse));
      }

      const playerController = new PlayerController();

      //add the creator of this game as dealer
      const dealer = new PlayerModel({
        folded: false, 
        isDealer: true,
        points: userResponse.points,
        hand: [],
        isTurn: false,
        email: userResponse.email
      });

      const newPlayerResponse = await playerController.create(dealer);

      if (!(newPlayerResponse instanceof PlayerModel)) {
        console.log("Error: database could not create player");
        res.json(errorFunction(true, "Error: database could not create player: " + newPlayerResponse));
      }

      const newPlayerArray = [];
      newPlayerArray.push(dealer);

      const gameController = new GameController();      
      const newGame = new GameModel({
        pot: req.body.game.anteAmount,
        roundCount: 1,
        status: 'starting',
        players: newPlayerArray,
        deck: [],
        requiredPointsPerPlayer: req.body.game.requiredPointsPerPlayer,
        anteAmount: req.body.game.anteAmount,
        bet: 0,
        roundOneMoves: [],
        roundTwoMoves: []
      });

      const createdGame = await gameController.create(newGame);

      if (!(createdGame instanceof GameModel)) {
        console.log("Error: database could not create game");
        return res.json(errorFunction(true, "Error: database could not create game"));
      }

      console.log("Success: game created in database");
      res.json({game: createdGame});
    }
    catch (error) {
      console.log("Error: There was a problem creating the game \n\n" + error);
      res.json(errorFunction(true, "Error: There was a problem creating the game \n\n" + error));
    }
  }));

  app.put('/api/game/add-player', async (req, res) => {
    try {
      const gameController = new GameController();
      const userController = new UserController();
      const gameId = req.body.params.gameId;
      const userId = req.body.params.userId;
      const game = await gameController.get(gameId);
      const user = await userController.getById(userId);

      //need to perform check that game and user exist

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

  app.put('/api/game/start', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = Object.values(req.body.params.gameId)[0];

      console.log(gameId)

      const game = await gameController.get(gameId);
      const shuffledDeck = shuffleDeck();
      const updatedPlayersArray = game.players;

      //set the second player (left of dealer) to their turn
      updatedPlayersArray[1].isTurn = true;

      //get unshuffled deck from db, pass into shuffleDeck() and assign 5 cards to each player

      //deal 5 cards to each player
      const update = {
        status: 'in progress',
        players: updatedPlayersArray,
        deck: shuffledDeck
      };

      const gameStartedResponse = await gameController.start(gameId, update);

      if (!(gameStartedResponse instanceof GameModel)) {
        console.log("Error: database could not find user: " + gameStartedResponse);
        res.json(errorFunction(true, "Error: database could not find user: " + gameStartedResponse));
      }

      console.log('Success: game created')
      res.json({
        game: gameStartedResponse
      })
    }
    catch (error) {
      return res.json(errorFunction(true, "Error! There was an issue starting the game"));
    }
  }));

  app.put('/api/game/check', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.params.gameId;
      const game = await gameController.get(gameId);
      const action = 'check';

      //players cannot check if a bet has been made
      if (game.bet !== 0) {
        return res.json(errorFunction(true, "Error: cannot check if bet has been placed")); 
      }

      const playersArray = game.players;
      const updatedRoundArray = game.round === 1 ? game.roundOneMoves : game.roundTwoMoves;
      const isNextRound = updateGame(playersArray, updatedRoundArray, action);

      const update = {
        players: playersArray,
        [game.round === 1 ? 'roundOneMoves' : 'roundTwoMoves']: updatedRoundArray,
      };

      if (isNextRound) {
        update.roundCount = 2;
      }

      const updatedGame = await gameController.updateGame(gameId, update);

      console.log(updatedGame)

    }
    catch (error) {
      console.log('Error! Could not process check')
    }
  }));
}