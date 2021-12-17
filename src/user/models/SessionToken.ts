import mongoose from "mongoose";
import { UserSchema, User } from "./User";

export const SessionTokenSchema = new mongoose.Schema({
  user: {
    type: UserSchema,
    required: true,
  },
  id: {
    type: String, 
    unique: true,
    required: true
  },
  createdDateTime: {
    type: Date,
    required: true
  },
  expiredDateTime: {
    type: Date,
    required: true
  } 
});

export interface SessionToken {
  user: User;
  id: string;
  createdDateTime: Date; 
  expiredDateTime: Date;
}

export const SessionTokenModel = mongoose.model("SessionToken", SessionTokenSchema);