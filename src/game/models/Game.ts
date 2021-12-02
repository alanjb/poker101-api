import mongoose, { Schema } from 'mongoose';
import { Player, PlayerSchema } from "../../player/models/Player";
import { Card, CardSchema } from "./Card";

export const GameSchema = new Schema({
  pot: {
    type: Number,
    min: 0,
		trim: true,
    required: true
  },
  roundCount: {
    type: Number,
    min: 1,
    max: 2,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ["starting", "in progress", "complete", "aborted"]
  },
  players: {
    type: [PlayerSchema],
    validate: {
      validator: function(v) {
        return v => Array.isArray(v) && v.length >= 2 && v.length <= 6;
      },
      message: "Min: 2 Max: 6 Players"
    }
  },
  deck: {
    type: [CardSchema],
    validate: {
      validator: function(v) {
        return v => Array.isArray(v) && v.length >= 0 && v.length <= 52;
      },
      message: "Min: 0 Max: 52 Cards"
    }
  },
  requiredPointsPerPlayer: {
    type: Number,
    min: 0,
    required: true
  },
  anteAmount: {
    type: Number,
    min: 0,
    max: 1000000,
    required: true
  },
  roundOneMoves: {
    type: Array
  },
  roundTwoMoves: {
    type: Array
  },
});

export const GameModel = mongoose.model("Game", GameSchema);

export interface Game {
  pot: number;
  roundCount: number;
  status: string;
  players: Player[];
  deck: Card[];
  requiredPointsPerPlayer: number;
  anteAmount: number;
  roundOneMoves: string[]
  roundTwoMoves: string[];
}