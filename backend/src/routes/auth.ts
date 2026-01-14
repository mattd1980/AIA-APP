import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Configure Google OAuth Strategy
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  Google OAuth credentials not configured. Authentication will not work.');
}

const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
  (process.env.FRONTEND_URL 
    ? `${process.env.FRONTEND_URL}/api/auth/google/callback`
    : '/api/auth/google/callback');

// Configure Local Strategy for username/password
passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username: string, password: string, done) => {
      try {
        // Only allow 'admin' username
        if (username !== 'admin') {
          return done(null, false, { message: 'Invalid username' });
        }

        // Validate password
        const isValid = await authService.validateAdminPassword(password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid password' });
        }

        // Get or create admin user
        const user = await authService.findOrCreateAdminUser();
        return done(null, user);
      } catch (error: any) {
        return done(error, null);
      }
    }
  )
);

// Configure Google OAuth Strategy
passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.findOrCreateUser(profile);
        return done(null, user);
      } catch (error: any) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await authService.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Username/password login route
router.post('/login', (req: Request, res: Response, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ error: 'Login error' });
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

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
  (req: Request, res: Response) => {
    // Successful authentication, redirect to home
    // Use absolute URL if FRONTEND_URL is set, otherwise relative
    const redirectUrl = process.env.FRONTEND_URL || '/';
    res.redirect(redirectUrl);
  }
);

// Get current user
router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
router.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;
