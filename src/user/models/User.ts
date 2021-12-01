import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
  email:  {
    type: String,
    required: true,
  },
  points:  {
    type: Number,
    min: 0,
    default: 1000
  },
});

export const UserModel = mongoose.model("User", UserSchema);