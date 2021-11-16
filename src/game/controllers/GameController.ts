import { Game } from "../models/Game";

export default class GameController {
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

  // public discard(card) {
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