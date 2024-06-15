import { PassportStatic } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { AuthService, IUser } from '../';

export function InitLocalStrategy (passport: PassportStatic, authService: AuthService): void {
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await authService.authenticate({ username, password });
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  passport.serializeUser((user, done) => done(null, (user as IUser).id));
  passport.deserializeUser(async (userId: string, done) => {
    try {
      const user = await authService.getUserById(userId);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });
}
