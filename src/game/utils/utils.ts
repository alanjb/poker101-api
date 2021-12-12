import { Card } from "../models/Card";
import { Player } from "../../player/models/Player";
import { RoundMove } from "../models/RoundMove";
import { Game } from "../models/Game";
import * as PokerEvaluator from 'poker-evaluator';

export const handSize: number = 5;
let apiServer: any;
let socketio: any;

export const shuffleDeck = (deck: Card[]) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
  return deck;
}

export const resetTurns = (playersArray) => {
  playersArray.forEach(player => player.isTurn=false)
}

const determineMove = (move, i, raise, game, playersArray: Player[]) => {
  if(move === 'check') {
    return { player: playersArray[i], move: move };
  }  

  if(move === 'raise') {
    playersArray[i].points = playersArray[i].points - raise;
    return { player: playersArray[i], move: move, bet: raise };
  }  

  if (move === 'call') {
    playersArray[i].points = playersArray[i].points;
    return { player: playersArray[i], move: move, bet: game.raise }
  }

  if (move === 'folded') {
    playersArray[i].folded = true;
    return { player: playersArray[i], move: move, bet: game.raise }
  }
}

export const updateGame = (game: Game, playersArray: Player[], updatedRoundArray: RoundMove[], move: string, round: number, raise?: number, intermission?: boolean) => {
  let startNextRound: boolean;
  let index: number;
  const gameLog = [];

  console.log('updatedRoundArray222')
  console.log(updatedRoundArray)

  index = playersArray.findIndex(player => player.isTurn);

  updatedRoundArray[index] = determineMove(move, index, raise, game, playersArray);

  let gameLogItem: any = {
    player: playersArray[index], 
    move: move
  }

  if (raise) {
    gameLogItem.bet = raise;
  }
  
  gameLog.push(...game.gameLog, gameLogItem);
  
  if (!intermission) {

    //reached end of first round
    if (round === 1 && playersArray[0].isTurn) {

      let i = game.roundOneMoves.findIndex(roundMove => roundMove.move === 'check');

      if (i == -1) {
        resetTurns(playersArray);
        i = playersArray.findIndex(player => !player.isDealer && !player.folded)
        if (i !== -1)
          playersArray[i].isTurn = true;
        
        return {
          intermission: false, 
          startNextRound: true,
          gameLog: gameLog
        }
      } 
      
      //set intermission to true
      intermission = true;
      
      // set all to false
      resetTurns(playersArray);

      //handles first person who checked
      if( i !== -1)
      playersArray[i].isTurn = true;
    }
    else {
      //it will not be this players turn anymore
      resetTurns(playersArray);

      //if we reach end of array, loop back to dealer
      if (playersArray.length === index + 1) {
        playersArray[0].isTurn = true;
      }
      else {
        //we only care about folded players in round 2
        if (round === 2) {
          console.log('In round 2...')
          const numFolded = playersArray.filter(player => player.folded).length;
          const numMoved = updatedRoundArray.length;

          if(playersArray.length == numFolded + numMoved) { 
            console.log('End of round 2 - line 99');

            const winner = determineWinner(playersArray.filter(player => !player.folded))

            for (let i = 0; i < playersArray.length; i++) {
              if (playersArray[i].email == winner.email) {
                winner.points += game.pot;
                playersArray[i]= winner;
                break;
              }
            }

            return {
              startNextRound: false,
              intermission: false,
              winner: winner,
              gameLog: gameLog
            };
          }
          //make sure this player did not folder, if they did go to next. 

          while (playersArray[index + 1].folded) {
            if (index == playersArray.length) {
              console.log('End of round 2 - line 121');

              const winner = determineWinner(playersArray.filter(player => !player.folded))

              for (let i = 0; i < playersArray.length; i++) {
                if (playersArray[i].email == winner.email) {
                  winner.points += game.pot;
                  playersArray[i]= winner;
                  break;
                }
              }

              return {
                startNextRound: false,
                intermission: false,
                winner: winner,
                gameLog: gameLog
              };
            }
            index++;
          }
        }
        playersArray[index + 1].isTurn = true;
      }
    }
  }
  else {
    let i: number;

    resetTurns(playersArray);

    i = game.roundOneMoves.findIndex(roundMove => roundMove.move === 'check')
    if(i !== -1)
    playersArray[i].isTurn = true;
    
    if (i === -1) {
      intermission = false;
      startNextRound = true;

      //find first player in playersArray who is not dealer and who did not fold
      i = playersArray.findIndex(player => !player.isDealer && !player.folded)
      if (i !== -1)
      playersArray[i].isTurn = true;
    }
  }

  if (round == 2) {
    const numFolded = playersArray.filter(player => player.folded).length;
    const numMoved = updatedRoundArray.length;

    console.log(updatedRoundArray)

    if (playersArray.length == numFolded + numMoved) {
      console.log('End of round 2 - line 188');

      console.log('line 173', numFolded)
      console.log(numMoved)
  
      const winner = determineWinner(playersArray.filter(player => !player.folded))
  
      for (let i = 0; i < playersArray.length; i++) {
        if (playersArray[i].email == winner.email) {
          winner.points += game.pot;
          playersArray[i]= winner;
          break;
        }
      }
      
      return {
        startNextRound: false,
        intermission: false,
        winner: winner,
        gameLog: gameLog
      };
    }
  }
  
  return {
    startNextRound: startNextRound,
    intermission: intermission,
    gameLog: gameLog
  }
}

export const getSocketIO = () => {
  if(socketio)
    return socketio;
  else 
    console.error('Web Socket server not initialized')
}

export const startWS = (server) => {
  console.log('Configuring web sockets...');

  try {
    const socketIO = require("socket.io");
    const io = socketIO(server);
    socketio = io;
    let interval: any;
    apiServer = server;

    io.on("connection", (socket) => {
      console.log("Client connected: " + socket.id);

      if (interval) {
        clearInterval(interval);
      }

      socket.on("disconnect", (socket) => {
        console.log("Client disconnected...");
        clearInterval(interval);
      });
    })
  }
  catch(error) {
    console.log('Error: There was an issue starting web socket server \n\n' + error)
  }
};

export const emitUpdatedGame = (updatedGame) => {
  try {
    socketio.emit("getUpdatedGame", updatedGame);
  }
  catch(error) {
    throw new Error('Error: Could not broadcast game update to clients: ' + error);
  }
};

export const emitTimer = (socket: any, initDate, gameId) => {
  const timer = (new Date().getTime() - initDate.getTime()) / 1000;
  socket.emit("getLobbyTimer", {gameId: gameId, timer: Math.round(timer)});
};

export const clearEmits = async (socket, gameId, intervalId, initDate) => {
  let timer = (new Date().getTime() - initDate.getTime()) / 1000;
  setTimeout(callOnTimerExpiry, 300000 - (timer*1000), socket, intervalId, gameId);
};

export const callOnTimerExpiry = (socket, intervalId, gameId) => {
  clearInterval(intervalId);
  socket.emit("LobbytTimerExpired", {gameId: gameId, LobbytTimerExpired: true});
}

//@param All players
//@return player with the best hand
export const determineWinner = (players) => {
  let playersRanks = players.map( (player, index) => {
    return PokerEvaluator.evalHand(player.hand.map(card => card.suit.charAt(0) + card.symbol.charAt(0))).value
  })
  let max = -1;
  for (let i = 0; i < playersRanks.length; i++) {
   if (playersRanks[i] > max)
   max = playersRanks[i];
  }
  return players[playersRanks.indexOf(max)];
}
