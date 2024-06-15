import express, { Express, Router } from 'express';
import logger from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import expressFlash from 'express-flash';
import expressSession from 'express-session';
import swaggerJsDoc from 'swagger-jsdoc';
import passport from 'passport';
import swaggerUI from 'swagger-ui-express';
import swaggerConfig from '../swagger';
import { AuthService, InitLocalStrategy } from '@modules';
import { Environment, isProduction } from '@utils';

function App (authService: AuthService, mainRouter: Router): Express {
  const app = express();
  app.use(logger('dev'));
  app.use(express.json({ limit: '16mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: false }));
  app.use(
    cors({
      origin: Environment.getAllowedOrigins(),
      credentials: true
    })
  );
  app.use(expressFlash());
  app.use(cookieParser());
  app.use(
    expressSession({
      secret: Environment.getSessionSecret(),
      resave: false,
      saveUninitialized: false,
      cookie: {
        /**
         * If we set cookie.secure set to true and we are NOT using SSL (i.e. https protocol)
         * then the cookie with the session id is not returned to
         * the browser and everything fails silently.
         */
        secure: isProduction(Environment.getNodeEnv())
      }
    })
  );

  // #region ============================ SWAGGER CONFIG =============================
  // reference: https://swagger.io/specification/#infoObject
  const swaggerDocs = swaggerJsDoc(swaggerConfig);
  app.use(`/api/${Environment.getApiVersion()}/docs`, swaggerUI.serve, swaggerUI.setup(swaggerDocs));
  // #endregion -----------------------------------------------------------------------

  app.use(passport.initialize());
  app.use(passport.session());
  InitLocalStrategy(passport, authService);

  app.use('/', mainRouter);

  return app;
}

export default App;
