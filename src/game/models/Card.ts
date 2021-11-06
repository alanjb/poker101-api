import mongoose, { Schema } from "mongoose";

export const CardSchema = new Schema({
  id: String,
  symbol: String,
  suit: String
});

export const Card = mongoose.model("Card", CardSchema);