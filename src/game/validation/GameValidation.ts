import joi from "joi";
import { errorFunction } from "../../app/config/utils";
import { PlayerSchema } from "../models/Player";
import { Game } from "../models/Game";

const gameCreationPlayerValidation = {
  id: joi.string(),
  points: joi.number(),
};

const gameCreationValidation = joi.object({
  requiredPointsPerPlayer: joi.number().required().positive(),
  antiAmount: joi.number().required(),
  players: joi.array().items(joi.object(gameCreationPlayerValidation)),
});

//middleware function - https://www.bacancytechnology.com/blog/joi-validation-in-nodejs-and-express
export const gameValidationMiddleware = (req, res, next) => {
  console.log('Running game creation validation...');
  
  if (req == null) {
    res.status(406);
      
    return res.json(
      errorFunction(true, `Error in User Data: Request Object is Null`)
    );
  }

  else {
    const payload = {
      requiredPointsPerPlayer: req.body.game.requiredPointsPerPlayer,
      antiAmount: req.body.game.antiAmount,
      players: req.body.game.players,
    };
  
    const { error } = gameCreationValidation.validate(payload);
    
    if (error) {
      res.status(406);
      
      return res.json(
        errorFunction(true, `${error}`)
      );
    }
    else {
      next();
    }
  }
};