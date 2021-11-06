import mongoose, { Schema } from 'mongoose';
import { PlayerSchema } from "./Player";
import { CardSchema } from "./Card";

export const GameSchema = new Schema({
  id: {
    type: String,
  },
  pot: {
    type: Number,
		trim: true,
  },
  roundCount: Number,
  status: String,
  players: {
    type: [PlayerSchema],
  },
  deck: [CardSchema],
  requiredPointsPerPlayer: Number,
  antiAmount: Number
});

export const Game = mongoose.model("Game", GameSchema);