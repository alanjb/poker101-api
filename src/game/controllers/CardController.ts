import { CardModel } from "../models/Card";
import CardData from "../data/CardData";

export default class CardController {
  public async getAll() {
    try {
        return await CardModel
        .find({});
      }
      catch(error) {
        console.log("Database find error - could not fetch all cards");
        return error;
      }
  }

  public async create() {
    try {
    await CardModel
      .insertMany(CardData);
    }
    catch(error) {
        console.log("Database save error - could not create cards");
        return error;
      }
  }
}