import { required } from "joi";
import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  firstName:  {
    type: String,
    required: true
  },
  lastName:  {
    type: String,
    required: true
  },
  email:  {
    type: String,
    required: true
  },
  points:  {
    type: Number,
    min: 0,
    default: 1000
  },
});

export const User = mongoose.model("User", UserSchema);