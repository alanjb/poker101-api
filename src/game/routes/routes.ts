import { errorFunction } from "../../app/config/utils";
import { Game } from "../models/Game";
import { Player } from "../models/Player";
import GameController from '../controllers/GameController';
import express from "express";
import UserController from "../../user/controllers/UserController";
import { shuffleDeck } from '../utils/utils';

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
            games: null
          })
        });
    } catch (error) {
      res.status(403);
      return res.json(errorFunction(true, "Error Creating User"));
    }
  });

  app.post('/api/game/create', (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const newGame = new Game({
        pot: req.body.game.anteAmount,
        roundCount: 1,
        status: 'starting',
        requiredPointsPerPlayer: req.body.game.requiredPointsPerPlayer,
        anteAmount: req.body.game.anteAmount
      });
  
      return gameController
        .create(newGame)
        .then((game) => {
          console.log("Game Successfully Created..." + game);
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
      return res.json(errorFunction(true, "Error Creating game"));
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
          if (player.email == user.email) {
            console.log("Error: User is already added to this game");
            return res.json(errorFunction(true, "Error: Could not add player to game, player already added")); 
          }
        });
      }

      const update = {
        players: [
          ...game.players,
          {
            userId: user.email,
            folded: false, 
            isDealer: false,
            points: user.points,
            hand: [],
            isTurn: false
          }
        ]
      };

      console.log(update)

      gameController
        .addPlayer(gameId, update)
        .then(game => {
          console.log('game', game)
        })
        .catch(error => {
          console.log('Error! Could not add user: ' + error);
        });
    } catch (error) {
      return res.json(errorFunction(true, "Error: There was an issue adding player to game: " + error)); 
    }
  });

  app.put('/api/game/start', async (req: any, res: any) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.params.gameId;

      //find game object in DB
      const game = await gameController.get(gameId);

      //shuffle deck
      const shuffledDeck = shuffleDeck();

      //get players array
      const updatedPlayersArray = game.players;

      //make second player turn
      updatedPlayersArray[1].isTurn = true;

      //deal 5 cards to each player
      
      // const update = {
      //   status: 'in progress',
      //   players: updatedPlayersArray,
      //   deck: shuffledDeck
      // };
      
      // return gameController
      //   .start(gameId, update)
      //   .then(() => {
      //     res.json({
      //       gameStarted: true
      //     })
      //   })
      //   .catch(error => {
      //     return res.json(errorFunction(true, "Error: Could not start game: " + error));
      //   });

    } catch (error) {
        return res.json(errorFunction(true, "Error! There was an issue starting the game"));
    }
  });

  app.put('/api/game/check', (req, res) => {
    try {
      const gameController = new GameController();
      const gameId = req.body.params.gameId;
      const playerId = req.body.params.playerId;

      const filter = {
        _id: gameId,
      };

      return gameController
        .get(filter)
        .then(game => {

          const players: Player[] = [
            {
              folded: false,
              isDealer: false,
              points: 300,
              hand: [
                { symbol: '', suit: '' },
                { symbol: '', suit: '' },
                { symbol: '', suit: '' },
                { symbol: '', suit: '' },
                { symbol: '', suit: '' },
              ],
              isTurn: false
            },
            {
              folded: false,
              isDealer: false,
              points: 300,
              hand: [
                { symbol: '', suit: '' },
                { symbol: '', suit: '' },
                { symbol: '', suit: '' },
                { symbol: '', suit: '' },
                { symbol: '', suit: '' },
              ],
              isTurn: false
            },
            {
              folded: false,
              isDealer: false,
              points: 300,
              hand: [
                { symbol: '', suit: '' },
                { symbol: '', suit: '' },
                { symbol: '', suit: '' },
                { symbol: '', suit: '' },
                { symbol: '', suit: '' },
              ],
              isTurn: false
            }
          ]

          game.players = [
            {

            }
          ];
          
          // console.log(players);

          // const filter = {
          //   players
          // }

          // gameController
          //   .check(filter)
          //   .then(game => {
          //     //updated game to all players, will set next player turn

          //     return game;
          //   })
          //   .catch(error => {

          //   });
        })
        .catch(error => {
          
        });

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