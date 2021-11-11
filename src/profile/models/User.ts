import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  email: String,
  points: Number
});

export const User = mongoose.model("User", UserSchema);