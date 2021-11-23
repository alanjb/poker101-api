import mongoose, { Schema } from "mongoose";

export const CardSchema = new Schema({
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

export const CardModel = mongoose.model("Card", CardSchema);

export interface Card {
  symbol: string; 
  suit: string;
}