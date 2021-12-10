import { UserModel } from "../../user/models/User";
import bcrypt from 'bcryptjs';
import { Strategy as LocalStrategy } from 'passport-local';

export default function(passport: any) {
  passport.use(
    new LocalStrategy((username, password, done) => {
      UserModel.findOne({ username: username }, (err, user) => {
        if (err) throw err;
        if (!user) return done(null, false);
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) throw err;
          if (result === true) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      });
    })
  );
}