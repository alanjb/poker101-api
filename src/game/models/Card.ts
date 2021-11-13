import mongoose, { Schema } from "mongoose";

export const CardSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true,
    enum: ["diamond", "spade", "heart", "club"]
  },
  suit: {
    type: String,
    required: true,
    enum: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
  },
});

export const Card = mongoose.model("Card", CardSchema);