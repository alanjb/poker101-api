import mongoose from "mongoose";
import { CardSchema } from "./Card";

export const PlayerSchema = new mongoose.Schema({
  id: String,
  folded: Boolean,
  isDealer: Boolean,
  points: Number,
  hand: [CardSchema],
});

export const Player = mongoose.model("Player", PlayerSchema);