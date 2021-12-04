import { Card } from "../models/Card";
import { Player } from "../../player/models/Player";
import { RoundMove } from "../models/RoundMove";
import { Game } from "../models/Game";

export const handSize: number = 5;

//The Fisher-Yates algorithm
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