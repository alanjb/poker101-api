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

export const updateGame = (game: Game, playersArray: Player[], updatedRoundArray: RoundMove[], move: string, round: number, raise?: number) => {
  let startNextRound: boolean;
  let index: number;

  for (let i = 0; i < playersArray.length; i++){
    if (playersArray[i].isTurn === true) {
      index = i;

      if(move === 'check') {
        updatedRoundArray[index] = { move: move };
      }  

      if(move === 'raise') {
        playersArray[i].points = playersArray[i].points - raise;
        updatedRoundArray[index] = { move: move, bet: raise };
      }  

      if (move === 'call') {
        playersArray[i].points = playersArray[i].points;
        updatedRoundArray[index] = { move: move, bet: game.raise }
      }

      break;
    }
  }

  //it will not be this players turn anymore
  playersArray[index].isTurn = false;

  //go to players who checked to determine whether they want to call, raise or fold

  //if we reach end of array, loop back to dealer
  if (playersArray.length === index + 1) {
    playersArray[0].isTurn = true;
  }
  else {
    playersArray[index + 1].isTurn = true;
    
    //fix this
    // if (round === 1 && index+1 === 1 && playersArray[1] !== null) {
    //   startNextRound = true;
    // }
  }

  return startNextRound;
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

      interval = setInterval(() => emitTimer(socket), 1000);

      //if game updated, trigger emit
      // emitUpdatedGame(game, socket);

      socket.on("disconnect", (socket) => {
        console.log("Client disconnected...");
        clearInterval(interval);
      });
    })
  }
  catch(error) {
    console.log('Error: ' + error)
  }
};

export const emitUpdatedGame = (updatedGame) => {
  try {
    socketio.emit("getUpdatedGame", updatedGame);
  }
  catch(error) {
    throw new Error('Error! Could not broadcast game update to clients: ' + error);
  }
};

export const emitTimer = (socket: any) => {
  const response = new Date();
  socket.emit("getLobbyTimer", response);
};

//@param All players
//@return player with the best hand
export const determineWinner = (players) => {
  let playersRanks = players.map( (player, index) =>
    PokerEvaluator.evalHand(player.hand.map(card => card.suit.charAt(0) + card.symbol.charAt(0))).value
  )
  let max = -1;
  for (let i = 0; i < playersRanks.length; i++) {
   if (playersRanks[i] > max)
   max = playersRanks[i];
  }
  return players[playersRanks.indexOf(max)];
}
