import { checkJwt } from '../security/checkJwt';
import { gameValidationMiddleware } from '../../game/validation/GameValidation';

export default function middleware(req, res, next) {
  // checkJwt();

  if (!req) {
    throw new Error(
      "req couldn't load"
    );
  }

  if (req.originalUrl.includes('/api/game')) {
    console.log('Executing game middleware...');
    gameValidationMiddleware(req, res, next);
  }

  if (req.originalUrl.includes('/api/profile')) {
    console.log('Executing profile middleware...');
    // gameValidationMiddleware(req, res, next);
  }
  
  next();
}