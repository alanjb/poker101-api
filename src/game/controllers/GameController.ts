import { GameModel } from "../models/Game";

export default class GameController {

  /** 
   * @param {Object} id  
   * @return {response} The request game object
   */ 
  public async get(id) {
    try {
      return await GameModel.findById(id);
    } catch (error) {
      return error;
    }
  }

  /** 
   * @return {response} All game objects
   */ 
  public async getAll() {
    try {
      return await GameModel.find({})
    } catch (error) {
      return error;
    }
  }

  /** 
   * @param {Object} game 
   * @return {response} The newly created game
   */ 
  public async create(game) {
    try {
      return await game.save();
    }
    catch (error){
      return error;
    } 
  }
 
   /** 
   * @param {Object} id Find game by id and update
   * @param {Object} update Applies id to given object property
   * @return {response} The result of adding num1 and num2.
   */ 
  public async addPlayer(id, update) {
    try {
      return await GameModel.findByIdAndUpdate(id, update, {new: true});
    }
    catch (error) {
      return error;
    }
  }

   /** 
   * @param {string} id The first number to add.
   * @param {Object} update Upda te game status to in progress, set player 2's isTurn to true
   * @return {response} The result of adding num1 and num2.
   */ 
  public async start(id, update) {
    try {
      return await GameModel.findByIdAndUpdate(id, update, {new: true}); 
    } catch (error) {
      return error
    }
  }

  /** 
   * @param {string} id  
   * @param {Object} update 
   * @return {response} The updated game object
   */ 
  public async updateGame(id, update) {
    try {
      return await GameModel.findByIdAndUpdate(id, update, {new: true});
    } catch (error) {
      return error;
    }
  }
}