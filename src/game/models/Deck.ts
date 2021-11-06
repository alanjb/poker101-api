import mongoose, { Schema } from 'mongoose';
import { Card } from './Card';

//add validation here 
export const DeckSchema = new Schema({
  id: String,
  cards: [{ cards: [Card] }],
});

export const Deck = mongoose.model("Deck", DeckSchema);