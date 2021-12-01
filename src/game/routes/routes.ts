import express from "express";
import { errorFunction } from "../../app/config/utils";
import { GameModel } from "../models/Game";
import { Player, PlayerModel } from "../../player/models/Player";
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
        console.log("Error: database could not create game: " + createdGame);
        return res.json(errorFunction(true, "Error: database could not create game: " + createdGame));
      }

      res.json({game: createdGame});
    }
    catch (error) {
      console.log("Error: There was a problem creating the game \n\n" + error);
      res.json(errorFunction(true, "Error: There was a problem creating the game \n\n" + error));
    }
  }));

  app.put('/api/game/add-player', asyncHandler(async (req: any, res: any) => {
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

        const updatedGame = await gameController.addPlayer(gameId, update);

        if (updatedGame instanceof GameModel) {
          return res.json({
            game: updatedGame
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
  }));

  app.put('/api/game/start', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.params.gameId;
      const game = await gameController.get(gameId);
      const shuffledDeck = shuffleDeck();
      const updatedPlayersArray = game.players;

      //set the second player (left of dealer) to their turn
      updatedPlayersArray[1].isTurn = true;

      //get un-shuffled deck from db, pass into shuffleDeck() and assign 5 cards to each player

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
      const round = game.roundCount;
      const updatedRoundArray = round === 1 ? game.roundOneMoves : game.roundTwoMoves;
      const startNextRound = updateGame(game, playersArray, updatedRoundArray, action, round);

      const update = {
        players: playersArray,
        [round === 1 ? 'roundOneMoves' : 'roundTwoMoves']: updatedRoundArray,
      };

      if (startNextRound) {
        update.roundCount = 2;
      }

      const updatedGame = await gameController.updateGame(gameId, update);

      res.json({
        game: updatedGame
      });
    }
    catch (error) {
      console.log('Error! Could not process check')
    }
  }));

  app.put('/api/game/bet', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.gameId;
      const bet = req.body.bet;
      const game = await gameController.get(gameId);

      console.log(bet);

      //perform check that player has enough to bet
      const thisPlayer = game.players.find(player => player.isTurn === true);

      if (game.bet !== 0) {
        console.log("Error: bet has already been made");
        return res.json(errorFunction(true, "Error: bet has already been made")); 
      }

      if (thisPlayer.points < bet) {
        console.log("Error: player does not have enough money to bet");
        return res.json(errorFunction(true, "Error: player does not have enough money to bet")); 
      }

      const action: string = 'bet';
      const playersArray: Player[] = game.players;
      const round: number = game.roundCount;
      const updatedRoundArray: string[] = round === 1 ? game.roundOneMoves : game.roundTwoMoves;
      const startNextRound: boolean = updateGame(game, playersArray, updatedRoundArray, action, round, bet);

      const update = {
        players: playersArray,
        [round === 1 ? 'roundOneMoves' : 'roundTwoMoves']: updatedRoundArray,
        bet: Number.parseInt(bet),
        pot: Number.parseInt(game.pot) + Number.parseInt(bet)
      };

      if (startNextRound) {
        update.roundCount = 2;
      }

      const updatedGame = await gameController.updateGame(gameId, update);

      if (updatedGame instanceof GameModel) {
        return res.json({
          game: updatedGame
        });
      }
      else {
        console.log("Error: database could not save game");
        return res.json(errorFunction(true, "Error: database could not save game")); 
      }
    }
    catch (error) {
      console.log('Error! Could not process check');
      return res.json(errorFunction(true, 'Error! Could not process check'));
    }
  }));

  app.put('/api/game/call', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.params.gameId;
      const game = await gameController.get(gameId);
      const action = 'call';
      const round = game.roundCount;

      //players cannot check if a bet has been made
      if (game.bet === 0) {
        return res.json(errorFunction(true, "Error: cannot call if bet has not been placed")); 
      }

      const playersArray = game.players;
      const updatedRoundArray = round === 1 ? game.roundOneMoves : game.roundTwoMoves;
      const startNextRound = updateGame(game, playersArray, updatedRoundArray, action, round);

      const update = {
        players: playersArray,
        [game.round === 1 ? 'roundOneMoves' : 'roundTwoMoves']: updatedRoundArray,
        bet: Number.parseInt(game.bet) * 2,
        pot: Number.parseInt(game.pot) + Number.parseInt(game.bet)
      };

      if (startNextRound) {
        update.roundCount = 2;
      }

      const updatedGame = await gameController.updateGame(gameId, update);

      res.json({
        game: updatedGame
      });
    }
    catch (error) {
      console.log('Error! Could not process check')
    }
  }));

  app.put('/api/game/raise', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.params.gameId;
      const raise = req.body.params.raise;
      const game = await gameController.get(gameId);
      const action = 'raise';

      //players cannot check if a bet has been made
      if (game.bet === 0) {
        console.log("Error: cannot raise if bet has not been placed");
        return res.json(errorFunction(true, "Error: cannot raise if bet has not been placed")); 
      }

      const playersArray = game.players;
      const updatedRoundArray = game.round === 1 ? game.roundOneMoves : game.roundTwoMoves;
      const round = game.round;
      const startNextRound = updateGame(game, playersArray, updatedRoundArray, action, round, raise);

      const update = {
        players: playersArray,
        [game.round === 1 ? 'roundOneMoves' : 'roundTwoMoves']: updatedRoundArray,
        bet: (game.bet * 2) + raise
      };

      if (startNextRound) {
        update.roundCount = 2;
      }

      const updatedGame = await gameController.updateGame(gameId, update);

      res.json({
        game: updatedGame
      });
    }
    catch (error) {
      console.log('Error! Could not process check')
    }
  }));

  app.put('/api/game/fold', asyncHandler(async (req: any, res: any) => {
    try {
    }
    catch (error) {
      console.log('Error! Could not process fold request')
    }
  }));

  app.put('/api/game/complete', asyncHandler(async (req: any, res: any) => {
    try {
    }
    catch (error) {
      console.log('Error! Could not process check')
    }
  }));
}