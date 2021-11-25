import { Player } from "../models/Player";

export default class GameController {
  public async create(player) {
    try {
      return await player.save();
    }
    catch (error){
      return error;
    } 
  }
}