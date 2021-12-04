import express from "express";
import { errorFunction } from "../../app/config/utils";
import { GameModel } from "../models/Game";
import { PlayerModel } from "../../player/models/Player";
import GameController from '../controllers/GameController';
import asyncHandler from "express-async-handler";
import UserController from "../../user/controllers/UserController";
import { shuffleDeck, updateGame, handSize } from '../utils/utils';
import PlayerController from "../../player/controllers/PlayerController";
import { UserModel } from "../../user/models/User";

export function initGameRoutes(app: express.Application) {
  console.log('- Initializing game routes');

  app.get('/api/game/game', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.query.gameId;
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
        return res.json(errorFunction(true, "Error: database could not find user: " + userResponse));
      }

      const requiredPointsPerPlayer = Number.parseInt(req.body.game.requiredPointsPerPlayer);
      const anteAmount = Number.parseInt(req.body.game.anteAmount);

      //require that user creating game has enough points 
      if (userResponse.points < requiredPointsPerPlayer || userResponse.points < anteAmount * 3) {
        console.log("Error: User creating this game does not have enough points");
        return res.json(errorFunction(true, "Error: User creating this game does not have enough points"));
      }

      if (requiredPointsPerPlayer <= anteAmount) {
        console.log("Error: Required points must be greater than ante");
        return res.json(errorFunction(true, "Error: Required points must be greater than ante"));
      }

      //add the creator of this game as dealer
      const dealer = new PlayerModel({
        folded: false, 
        isDealer: true,
        points: Number.parseInt(userResponse.points),
        hand: [],
        isTurn: false,
        email: userResponse.email
      });

      const playerController = new PlayerController();
      const newPlayerResponse = await playerController.create(dealer);

      if (!(newPlayerResponse instanceof PlayerModel)) {
        console.log("Error: database could not create player");
        return res.json(errorFunction(true, "Error: database could not create player \n\n" + newPlayerResponse));
      }

      const newPlayerArray = [];
      newPlayerArray.push(dealer);

      const gameController = new GameController();      
      const newGame = new GameModel({
        pot: 0,
        roundCount: 1,
        status: 'starting',
        players: newPlayerArray,
        deck: [],
        requiredPointsPerPlayer: req.body.game.requiredPointsPerPlayer,
        anteAmount: req.body.game.anteAmount,
        roundOneMoves: [],
        roundTwoMoves: []
      });

      const createdGame = await gameController.create(newGame);

      if (!(createdGame instanceof GameModel)) {
        console.log("Error: database could not create game: " + createdGame);
        return res.json(errorFunction(true, "Error: database could not create game \n\n" + createdGame));
      }

      return res.json({game: createdGame});
    }
    catch (error) {
      console.log("Error: There was a problem creating the game \n\n" + error);
      return res.json(errorFunction(true, "Error: There was a problem creating the game"));
    }
  }));

  app.put('/api/game/add-player', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const userController = new UserController();
      const gameId = req.body.params.gameId;
      const userId = req.body.params.userId;

      const game = await gameController.get(gameId);

      if (!(game instanceof GameModel)) {
        console.log("Error: database could not find game: " + game);
        return res.json(errorFunction(true, "Error: game does not exist \n\n" + game));
      }

      const user = await userController.getById(userId);

      if (!(user instanceof UserModel)) {
        console.log("Error: database could not find user: " + game);
        return res.json(errorFunction(true, "Error: user does not exist \n\n" + game));
      }

      let playerExistsInGame: boolean;

      //avoid adding player twice 
      if (game.players.length >= 1) {
        game.players.forEach(player => {
          if (player.email === user.email) {
            playerExistsInGame = true; 
          }
        });
      }

      if (playerExistsInGame) {
        console.log("Error: User is already added to this game");
        return res.json(errorFunction(true, "Error: Could not add player to game, player already added")); 
      }

      //check if user has minimum points for two rounds
      if (user.points < game.anteAmount * 3) {
        console.log("Error: User doesn't have enough points");
        return res.json(errorFunction(true, "Error: You can't join the game because you don't have enough points")); 
      }

      const playerController = new PlayerController();
      const player = new PlayerModel({
        folded: false, 
        isDealer: false,
        points: Number.parseInt(user.points),
        hand: [],
        isTurn: false,
        email: user.email
      });

      const newPlayer = await playerController.create(player);

      if (!(newPlayer instanceof PlayerModel)) {
        console.log("Error: database could not create player \n\n " + newPlayer);
        return res.json(errorFunction(true, "Error: database could not create player \n\n " + newPlayer));
      }

      const update = {
        players: [
          ...game.players,
          newPlayer
        ],
      }

      const updatedGame = await gameController.addPlayer(gameId, update);

      if (!(updatedGame instanceof GameModel)) {
        console.log("Error: database could not update game \n\n " + updatedGame);
        return res.json(errorFunction(true, "Error: database could not update game \n\n " + updatedGame));
      }

      console.log('Successfully added player to game...')
      return res.json({game: updatedGame});

    }
    catch (error) {
      console.log("Error: There was an issue adding player to game \n\n " + error)
      return res.json(errorFunction(true, "Error: There was an issue adding player to game \n\n " + error)); 
    }
  }));

  app.put('/api/game/start', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.params.gameId;
      const game = await gameController.get(gameId);
      
      if (!(game instanceof GameModel)) {
        console.log("Error: database could not find game: " + game);
        return res.json(errorFunction(true, "Error: game does not exist \n\n" + game));
      }

      const shuffledDeck = shuffleDeck();
      const updatedPlayersArray = game.players;
      let potAmount: number = 0;

      //once game starts, each player will add the ante amount from their points into the pot and add each players ante to the pot
      updatedPlayersArray.forEach(player => {
        player.points = player.points - game.anteAmount;
        potAmount += Number.parseInt(game.anteAmount);
      });

      //set the second player (left of dealer) to their turn
      updatedPlayersArray[1].isTurn = true;

      //get un-shuffled deck from db, pass into shuffleDeck() and assign 5 cards to each player
      for (let i = 0; i < handSize; i++){
        updatedPlayersArray.forEach((player, x) => {
          player.hand.push(shuffledDeck[x]);
          shuffledDeck.shift();
        })
      }

      const update = {
        status: 'in progress',
        players: updatedPlayersArray,
        deck: shuffledDeck,
        pot: potAmount
      };
     
      const gameStartedResponse = await gameController.start(gameId, update);

      if (!(gameStartedResponse instanceof GameModel)) {
        console.log("Error: database could not start game: " + gameStartedResponse);
        return res.json(errorFunction(true, "Error: database could not start game: " + gameStartedResponse));
      }

      console.log('Success: game created');
      
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

      if (!(game instanceof GameModel)) {
        console.log("Error: database could not find game: " + game);
        return res.json(errorFunction(true, "Error: game does not exist \n\n" + game));
      }

      //check if raise has been made
      if (game.raise !== 0) {
        console.log("Error: player cannot : " + game);
        return res.json(errorFunction(true, "Error: game does not exist \n\n" + game));
      }

      const action = 'check';
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

      if (updatedGame instanceof GameModel) {
        //web sockets - send this to everyone
        res.json({
          game: updatedGame
        });
      }
      else {
        console.log('Error: Database could not save check');
        return res.json(errorFunction(true, "Error: cannot check if bet has been placed - " + updatedGame)); 
      }
    }
    catch (error) {
      console.log('Error! Could not process check')
    }
  }));

  app.put('/api/game/call', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.params.gameId;
      const game = await gameController.get(gameId);
      const action = 'call';
      const round = game.roundCount;

      //players cannot call if there has not been a raise

      const playersArray = game.players;
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

  app.put('/api/game/raise', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.gameId;
      const raise = Number.parseInt(req.body.raise);

      const game = await gameController.get(gameId);

      //commonize this check
      if (!(game instanceof GameModel)) {
        console.log("Error: database could not find game: " + game);
        return res.json(errorFunction(true, "Error: game does not exist \n\n" + game));
      }

      const move = 'raise';
      const updatedPlayersArray = game.players;
      const round = game.roundCount;
      const updatedRoundArray = round === 1 ? game.roundOneMoves : game.roundTwoMoves;
      const startNextRound = updateGame(game, updatedPlayersArray, updatedRoundArray, move, round, raise);

      const update = {
        players: updatedPlayersArray,
        [round === 1 ? 'roundOneMoves' : 'roundTwoMoves']: updatedRoundArray,
        raise: true
      };

      if (startNextRound) {
        update.roundCount = 2;
      }

      const updatedGame = await gameController.updateGame(gameId, update);

      if (!(updatedGame instanceof GameModel)) {
        console.log("Error: database could not start game: " + updatedGame);
        return res.json(errorFunction(true, "Error: database could not start game: " + updatedGame));
      }

      console.log('Success: played raised: ' + raise);
      
      return res.json({
        game: updatedGame
      });
    }
    catch (error) {
      console.log('Error: Could not process raise')
      return res.json(errorFunction(true, "Error: There was an issue processing raise"));
    }
  }));
  
  app.put('/api/game/fold', asyncHandler(async (req: any, res: any) => {
    try {
    }
    catch (error) {
      console.log('Error: Could not process fold')
    }
  }));

  app.put('/api/game/discard', asyncHandler(async (req: any, res: any) => {
    try {
    }
    catch (error) {
      console.log('Error: Could not process discard')
    }
  }));

  app.put('/api/game/complete', asyncHandler(async (req: any, res: any) => {
    try {
    }
    catch (error) {
      console.log('Error: Could not process complete')
    }
  }));

  app.put('/api/game/abort', asyncHandler(async (req: any, res: any) => {
    try {
    }
    catch (error) {
      console.log('Error: Could not process abort')
    }
  }));
}