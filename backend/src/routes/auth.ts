import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import { authService } from '../services/auth.service';

const router = Router();

// Configure Local Strategy
passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username: string, password: string, done) => {
      try {
        const user = await authService.authenticateByEmailPassword(username, password);
        if (!user) {
          return done(null, false, { message: 'Email ou mot de passe incorrect' });
        }
        const passportUser = {
          ...user,
          name: user.name ?? undefined,
          picture: user.picture ?? undefined,
        };
        return done(null, passportUser);
      } catch (error: unknown) {
        return done(error, false);
      }
    }
  )
);

// Configure Google OAuth Strategy (only if credentials are provided)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_ENABLED = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

if (GOOGLE_ENABLED) {
  const backendUrl = (process.env.BACKEND_URL || process.env.GOOGLE_CALLBACK_URL || '').replace(/\/$/, '');
  const callbackURL = process.env.GOOGLE_CALLBACK_URL
    ? process.env.GOOGLE_CALLBACK_URL.replace(/\/$/, '')
    : backendUrl
      ? `${backendUrl}/api/auth/google/callback`
      : '/api/auth/google/callback';

  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await authService.findOrCreateUser(profile);
          const passportUser = {
            ...user,
            name: user.name ?? undefined,
            picture: user.picture ?? undefined,
          };
          return done(null, passportUser);
        } catch (error: unknown) {
          return done(error as Error, false);
        }
      }
    )
  );
  console.log('Google OAuth enabled');
} else {
  console.log('Google OAuth disabled - credentials not configured');
}

// Serialize user for session
passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await authService.getUserById(id);
    if (user) {
      const passportUser = {
        ...user,
        name: user.name ?? undefined,
        picture: user.picture ?? undefined,
      };
      done(null, passportUser);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, false);
  }
});

// Username/password login route
router.post('/login', (req: Request, res: Response, next) => {
  passport.authenticate('local', (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur d\'authentification' });
    }
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Identifiants incorrects' });
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ error: 'Erreur de connexion' });
      }
      return res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      });
    });
  })(req, res, next);
});

// Google OAuth routes (only if enabled)
if (GOOGLE_ENABLED) {
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  router.get(
    '/google/callback',
    passport.authenticate('google', {
      failureRedirect: frontendUrl ? `${frontendUrl}/login?error=auth_failed` : '/login?error=auth_failed',
    }),
    (req: Request, res: Response) => {
      const base = frontendUrl || '';
      const redirectUrl = base ? `${base.replace(/\/$/, '')}/` : '/';
      res.redirect(redirectUrl);
    }
  );
} else {
  router.get('/google', (req: Request, res: Response) => {
    res.status(503).json({ error: 'Google OAuth n\'est pas configure' });
  });

  router.get('/google/callback', (req: Request, res: Response) => {
    res.status(503).json({ error: 'Google OAuth n\'est pas configure' });
  });
}

// Check if Google OAuth is enabled
router.get('/google/enabled', (req: Request, res: Response) => {
  res.json({ enabled: GOOGLE_ENABLED });
});

// Get current user
router.get('/me', (req: Request, res: Response) => {
  if (req.user) {
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
      isAdmin: !!req.user.isAdmin,
    });
  } else {
    res.status(401).json({ error: 'Non authentifie' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err: Error | null) => {
    if (err) {
      return res.status(500).json({ error: 'Echec de la deconnexion' });
    }
    res.json({ message: 'Deconnexion reussie' });
  });
});

export default router;
