import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    min: 0,
    default: 1000
  },
});

export interface User {
  email: string;
  username: string;
  password: string; 
  points: number;
}

export const UserModel = mongoose.model("User", UserSchema);