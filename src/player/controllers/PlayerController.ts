export default class PlayerController {
  public async create(player) {
    try {
      return await player.save();
    }
    catch (error){
      return error;
    } 
  }
}