import { checkJwt } from '../security/checkJwt';
import { gameValidationMiddleware } from '../../game/validation/GameValidation';

export default function middleware(req, res, next) {
  // checkJwt();

  if (req.originalUrl.includes('/api/game')) {
    console.log('Executing game middleware...');
    gameValidationMiddleware(req, res, next);
  }

  if (req.originalUrl.includes('/api/user')) {
    console.log('Executing user middleware...');
    // gameValidationMiddleware(req, res, next);
  }
  
  next();
}