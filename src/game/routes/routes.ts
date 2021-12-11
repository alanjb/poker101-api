import express from "express";
import { errorFunction } from "../../app/config/utils";
import { GameModel } from "../models/Game";
import { PlayerModel } from "../../player/models/Player";
import GameController from '../controllers/GameController';
import CardController from '../controllers/CardController';
import asyncHandler from "express-async-handler";
import UserController from "../../user/controllers/UserController";
import { shuffleDeck, updateGame, handSize, emitUpdatedGame, determineWinner, getSocketIO, emitTimer, clearEmits } from '../utils/utils';
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
      return res.json(errorFunction(true, "Error: Could not start game"));
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
      res.json(errorFunction(true, "Error: Could not get games"));
    }
  }));

  app.post('/api/game/create', asyncHandler(async (req: any, res: any) => {
    try {
      const userController = new UserController();
      const userResponse = await userController.getById(req.body.userId);
  
      if (!(userResponse instanceof UserModel)) {
        console.log("Error: database could not find user: " + userResponse);
        return res.json(errorFunction(true, "Error: database could not find user"));
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
        console.log("Error: database could not create player \n\n" + newPlayerResponse);
        return res.json(errorFunction(true, "Error: database could not create player"));
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
        roundTwoMoves: [],
        intermission: false
      });

      const createdGame = await gameController.create(newGame);

      if (!(createdGame instanceof GameModel)) {
        console.log("Error: database could not create game: " + createdGame);
        return res.json(errorFunction(true, "Error: database could not create game"));
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

      //Promise.all, use date time

      const game = await gameController.get(gameId);

      if (!(game instanceof GameModel)) {
        console.log("Error: database could not find game: " + game);
        return res.json(errorFunction(true, "Error: game does not exist"));
      }

      const user = await userController.getById(userId);

      if (!(user instanceof UserModel)) {
        console.log("Error: database could not find user: " + game);
        return res.json(errorFunction(true, "Error: user does not exist"));
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
        return res.json(errorFunction(true, "Error: database could not create player"));
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
        return res.json(errorFunction(true, "Error: database could not update game"));
      }

      console.log('Successfully added player to game...')
      return res.json({game: updatedGame});

    }
    catch (error) {
      console.log("Error: There was an issue adding player to game \n\n " + error)
      return res.json(errorFunction(true, "Error: There was an issue adding player to game")); 
    }
  }));

  app.put('/api/game/initlobbytimer',  asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.params.gameId;
      const game = await gameController.get(gameId);
      let intervalId;

      if (!game.lobbytimerinit){
        const initDate = new Date();
        const update = { lobbytimerinit: initDate }
        const updatedGame = await gameController.updateGame(gameId, update);

        const sockIO = getSocketIO();
        intervalId = setInterval(() => emitTimer(sockIO, initDate, gameId), 1000);
        res.json({
          game: updatedGame
        })
        clearEmits(sockIO, gameId, intervalId, initDate);
      } else {
        res.json({
          game: game
        });
      }
    }
    catch (error) {
      console.log("Error: Could not init lobby timer \n\n " + error);
      res.json(errorFunction(true, "Error: Could not init lobby timer"));
    }
  }));

  app.put('/api/game/start', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.params.gameId;
      const game = await gameController.get(gameId);

      //only the dealer can start the game

      if (!(game instanceof GameModel)) {
        console.log("Error: database could not find game: " + game);
        return res.json(errorFunction(true, "Error: game does not exist"));
      }

      if (game.players.length <= 1) {
        console.log("Error: not enough players to start game");
        return res.json(errorFunction(true, "Error: not enough players to start game"));
      }
      
      let deck;
      const cardController = new CardController();
      const existingCards: any = await cardController.getAll();

      if(existingCards.length != 52) {
          deck = await cardController.create();
      } else {
        deck = existingCards;
      }

      const shuffledDeck = shuffleDeck(deck);
      const updatedPlayersArray = game.players;
      let potAmount: number = 0;

      //once game starts, each player will add the ante amount from their points into the pot and add each players ante to the pot
      updatedPlayersArray.forEach(player => {
        player.points = player.points - game.anteAmount;
        potAmount += Number.parseInt(game.anteAmount);
      });

      //set the second player (left of dealer) to their turn
      updatedPlayersArray[1].isTurn = true;

      //get deck, pass into shuffleDeck() and assign 5 cards to each player
      for (let i = 0; i < handSize; i++){
        updatedPlayersArray.forEach(player => {
          player.hand.push(shuffledDeck[0]);
          shuffledDeck.shift();
        });
      }

      const update = {
        status: 'in progress',
        players: updatedPlayersArray,
        deck: shuffledDeck,
        pot: potAmount,
      };
     
      const gameStartedResponse = await gameController.start(gameId, update);

      if (!(gameStartedResponse instanceof GameModel)) {
        console.log("Error: database could not start game: " + gameStartedResponse);
        return res.json(errorFunction(true, "Error: database could not start game"));
      }

      console.log('Success: game created');
      
      return res.json({
        game: gameStartedResponse
      })
    }
    catch (error) {
      console.log('Error: There was an issue starting the game \n\n ' + error)
      return res.json(errorFunction(true, "Error: There was an issue starting the game"));
    }
  }));

  app.put('/api/game/check', asyncHandler(async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const userController = new UserController();
      const gameId = req.body.params.gameId;
      const game = await gameController.get(gameId);

      if (!(game instanceof GameModel)) {
        console.log("Error: database could not find game: " + game);
        return res.json(errorFunction(true, "Error: game does not exist"));
      }

      //check if raise has been made
      if (game.raise !== 0) {
        console.log("Error: player cannot check if raise as been made");
        return res.json(errorFunction(true, "Error: player cannot check if raise as been made"));
      }

      if (game.intermission) {
        console.log("Error: player must call, raise or fold");
        return res.json(errorFunction(true, "Error: player must call, raise or fold"));
      }

      const action = 'check';
      const playersArray = game.players;
      const round = game.roundCount;
      const updatedRoundArray = round === 1 ? game.roundOneMoves : game.roundTwoMoves;
      const obj = updateGame(game, playersArray, updatedRoundArray, action, round);

      const update = {
        players: playersArray,
        [round === 1 ? 'roundOneMoves' : 'roundTwoMoves']: updatedRoundArray,
      };

      if (obj.startNextRound) {
        update.roundCount = 2;
      }

      const updatedGame = await gameController.updateGame(gameId, update);

      if (!(updatedGame instanceof GameModel)) {
        console.log("Error: database could not update game \n\n" + updatedGame);
        return res.json(errorFunction(true, "Error: could not update game"));
      }

      console.log('Success: player checked');    
      emitUpdatedGame(game);

      return res.json({
        game: updatedGame
      })
    }
    catch (error) {
      console.log('Error: Could not process check');
      return res.json(errorFunction(true, "Error: There was an issue processing check"));
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
      const userController = new UserController();
      const gameId = req.body.gameId;
      const raise = Number.parseInt(req.body.raise);
      const game = await gameController.get(gameId);

      //commonize this check
      if (!(game instanceof GameModel)) {
        console.log("Error: database could not find game: " + game);
        return res.json(errorFunction(true, "Error: game does not exist"));
      }

      if (game.raise !== 0 && raise <= game.raise) {
        console.log("Error:  raise must be greater than previous player's raise");
        return res.json(errorFunction(true, "Error: raise must be greater than previous player's raise"));
      }

      // const user = await userController.getById(userId);

      // if (user.points < raise) {
        
      // }
      
      //ensure players turn is true/allowed - return "not your turn"

      const move = 'raise';
      const updatedPlayersArray = game.players;
      const intermission = game.intermission;
      const round = game.roundCount;
      const updatedRoundArray = round === 1 ? game.roundOneMoves : game.roundTwoMoves;
      const obj = updateGame(game, updatedPlayersArray, updatedRoundArray, move, round, raise, intermission);

      const update = {
        players: updatedPlayersArray,
        [round === 1 ? 'roundOneMoves' : 'roundTwoMoves']: updatedRoundArray,
        raise: raise,
        pot: Number.parseInt(game.pot) + raise,
        intermission: obj.intermission
      };

      if (obj.startNextRound) {
        update.roundCount = 2;
      }

      const updatedGame = await gameController.updateGame(gameId, update);

      if (!(updatedGame instanceof GameModel)) {
        console.log("Error: database could not start game: " + updatedGame);
        return res.json(errorFunction(true, "Error: database could not start game"));
      }

      console.log('Success: player raised $' + raise);

      emitUpdatedGame(updatedGame);
      
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