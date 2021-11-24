import { Game } from "../models/Game";

export default class GameController {

  /** 
   * @param {Object} id  
   * @param {Object} update Upda te game status to in progress, set player 2's isTurn to true
   * @return {response} The result of adding num1 and num2.
   */ 
  public async get(id) {
    return await Game.findById(id);
  }

  /** 
   * @param {Object} id  
   * @param {Object} update Upda te game status to in progress, set player 2's isTurn to true
   * @return {response} The result of adding num1 and num2.
   */ 
  public getAll() {
    return Game
      .find({})
      .then(response => {
        console.log("Database find success - fetched all games");
        return response;
      })
      .catch(error => {
        console.log("Database find error - could not fetch all games");
        return error;
      }) 
  }

  /** 
   * @param {Object} id  
   * @param {Object} update Upda te game status to in progress, set player 2's isTurn to true
   * @return {response} The result of adding num1 and num2.
   */ 
  public create(game) {
    return game
      .save()
      .then(response => {
        console.log("Database save success - game created");
        return response;
      })
      .catch(error => {
        console.log("Database save error - could not create game");
        return error;
      }) 
  }
 
   /** 
   * @param {Object} id Find game by id and update
   * @param {Object} update Applies id to given object property
   * @return {response} The result of adding num1 and num2.
   */ 
  public async addPlayer(id, update) {
    return await Game.findByIdAndUpdate(id, update);
  }

   /** 
   * @param {string} id The first number to add.
   * @param {Object} update Upda te game status to in progress, set player 2's isTurn to true
   * @return {response} The result of adding num1 and num2.
   */ 
  public start(id, update) {
    return Game
      .findByIdAndUpdate(id, update)
      .then(response => {
        console.log("Success! Starting game...");
        return response;
      })
      .catch(error => {
        console.log("Error! Could not start game...");
        return error;
      }) 
  }

  /** 
   * @param {string} id  
   * @param {Object} update 
   * @return {response} The updated game object
   */ 
  public async updateGame(id, update) {
    return await Game.findByIdAndUpdate(id, update);
  }
  
  // public discard(cards) {
  //   return card
  //     .remove()
  //     .then((response) => {
  //       console.log("Database remove success - Card DISCARDED");
  //       return response;
  //     })
  //     .catch((response) => {
  //       console.log("Database save error - Card NOT DISCARDED");
  //       return response;
  //     }) 
  // }
}