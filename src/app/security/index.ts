import { UserModel } from "../../user/models/User";
import bcrypt from 'bcryptjs';
import { Strategy as LocalStrategy } from 'passport-local';

module.exports = function (passport) {
  passport.use(
    new LocalStrategy((username, password, done) => {
      UserModel.findOne({ username: username }, (err, user) => {
        if (err) console.error(err);

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

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser((id, cb) => {
    UserModel.findOne({ _id: id }, (err, user) => {
      const userInformation = {
        username: user.username,
      };
      cb(err, userInformation);
    });
  });
  
};