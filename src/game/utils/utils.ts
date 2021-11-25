import { Card } from "../models/Card";
import { Player } from "../../player/models/Player";

export const deck: Card[] = [
  { symbol: 'diamond', suit: '2' },
  { symbol: 'diamond', suit: '3' },
  { symbol: 'diamond', suit: '4' },
  { symbol: 'diamond', suit: '5' },
  { symbol: 'diamond', suit: '6' },
  { symbol: 'diamond', suit: '7' },
  { symbol: 'diamond', suit: '8' },
  { symbol: 'diamond', suit: '9' },
  { symbol: 'diamond', suit: '10' },
  { symbol: 'diamond', suit: 'J' },
  { symbol: 'diamond', suit: 'Q' },
  { symbol: 'diamond', suit: 'K' },
  { symbol: 'diamond', suit: 'A' },

  { symbol: 'spade', suit: '2' },
  { symbol: 'spade', suit: '3' },
  { symbol: 'spade', suit: '4' },
  { symbol: 'spade', suit: '5' },
  { symbol: 'spade', suit: '6' },
  { symbol: 'spade', suit: '7' },
  { symbol: 'spade', suit: '8' },
  { symbol: 'spade', suit: '9' },
  { symbol: 'spade', suit: '10' },
  { symbol: 'spade', suit: 'J' },
  { symbol: 'spade', suit: 'Q' },
  { symbol: 'spade', suit: 'K' },
  { symbol: 'spade', suit: 'A' },

  { symbol: 'heart', suit: '2' },
  { symbol: 'heart', suit: '3' },
  { symbol: 'heart', suit: '4' },
  { symbol: 'heart', suit: '5' },
  { symbol: 'heart', suit: '6' },
  { symbol: 'heart', suit: '7' },
  { symbol: 'heart', suit: '8' },
  { symbol: 'heart', suit: '9' },
  { symbol: 'heart', suit: '10' },
  { symbol: 'heart', suit: 'J' },
  { symbol: 'heart', suit: 'Q' },
  { symbol: 'heart', suit: 'K' },
  { symbol: 'heart', suit: 'A' },

  { symbol: 'club', suit: '2' },
  { symbol: 'club', suit: '3' },
  { symbol: 'club', suit: '4' },
  { symbol: 'club', suit: '5' },
  { symbol: 'club', suit: '6' },
  { symbol: 'club', suit: '7' },
  { symbol: 'club', suit: '8' },
  { symbol: 'club', suit: '9' },
  { symbol: 'club', suit: '10' },
  { symbol: 'club', suit: 'J' },
  { symbol: 'club', suit: 'Q' },
  { symbol: 'club', suit: 'K' },
  { symbol: 'club', suit: 'A' },
];

//The Fisher-Yates algorithm
export const shuffleDeck = () => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
  return deck;
}

export const updateGame = (updatedPlayersArray: Player[], updatedRoundArray: string[], action: string) => {
  updatedPlayersArray.forEach((player, i) => {
    if (player.isTurn) {
      updatedRoundArray[i] = action;
      updatedPlayersArray[i + 1].isTurn = true;
    }
  });
}