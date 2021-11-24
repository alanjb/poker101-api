import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  email:  {
    type: String,
    required: true,
    unique: true
  },
  points:  {
    type: Number,
    min: 0,
    default: 1000
  },
});

export const User = mongoose.model("User", UserSchema);