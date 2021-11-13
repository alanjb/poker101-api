import { required } from "joi";
import mongoose from "mongoose";
import { CardSchema } from "./Card";
import { UserSchema } from "../../profile/models/User";

export const PlayerSchema = new mongoose.Schema({
  id: {
    type: UserSchema,
    required: true
  },
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
}
});

export const Player = mongoose.model("Player", PlayerSchema);