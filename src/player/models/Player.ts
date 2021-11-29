import mongoose from "mongoose";
import { Card, CardSchema } from "../../game/models/Card";

export const PlayerSchema = new mongoose.Schema({
  folded: {
    type: Boolean,
    required: true
  },
  isDealer:  {
    type: Boolean,
    required: true
  },
  points:  {
    type: Number,
    required: true,
    min: 0
  },
  hand: {
    type: [CardSchema],
    validate: {
      validator: function(v) {
        return v => Array.isArray(v) && v.length == 5;
      },
      message: "Hand must be 5 cards"
    }
  },
  isTurn: {
    type: Boolean,
    required: true,
    default: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
});

export const PlayerModel = mongoose.model("Player", PlayerSchema);

export interface Player {
  folded: boolean; 
  isDealer: boolean;
  points: number;
  hand: Card[];
  isTurn: boolean;
  email: string;
}