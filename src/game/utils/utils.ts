import { Card } from "../models/Card";
import { Player } from "../../player/models/Player";
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

export const updateGame = (game: Game, playersArray: Player[], updatedRoundArray: string[], action: string, round: number, amount?: number) => {
  let startNextRound: boolean;
  let index: number;

  for (let i = 0; i < playersArray.length; i++){
    if (playersArray[i].isTurn === true) {
      index = i;

      // if(action === 'call') {
      //   playersArray[i].points = playersArray[i].points - game.bet;
      // }

      // if(action === 'raise') {
      //   playersArray[i].points = playersArray[i].points - (game.bet + amount);
      // }      
      
      break;
    }
  }

  updatedRoundArray[index] = action;

  //it will not be this players turn anymore
  playersArray[index].isTurn = false;

  //if we reach end of array, loop back to dealer
  if (playersArray.length === index+1) {
    playersArray[0].isTurn = true;
  }
  else {
    playersArray[index+1].isTurn = true;
    
    //fix this
    if (round === 1 && index+1 === 1 && playersArray[1] !== null) {
      startNextRound = true;
    }
  }

  return startNextRound;
}