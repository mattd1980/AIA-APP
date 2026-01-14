import prisma from '../database/client';

export interface GoogleProfile {
  id: string;
  displayName?: string;
  name?: { givenName?: string; familyName?: string };
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
}

export class AuthService {
  async findOrCreateUser(profile: GoogleProfile) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error('Email not provided by Google');
    }

    const displayName = profile.displayName || 
      (profile.name ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim() : null) ||
      email.split('@')[0];
    
    const picture = profile.photos?.[0]?.value;

    // Try to find user by Google ID first
    let user = profile.id
      ? await prisma.user.findUnique({ where: { googleId: profile.id } })
      : null;

    // If not found, try by email
    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (user) {
      // Update user info if needed
      if (profile.id && !user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: profile.id,
            name: displayName || user.name,
            picture: picture || user.picture,
          },
        });
      } else if (displayName || picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: displayName || user.name,
            picture: picture || user.picture,
          },
        });
      }
      return user;
    }

    // Create new user
    return await prisma.user.create({
      data: {
        email,
        googleId: profile.id,
        name: displayName,
        picture: picture,
      },
    });
  }

  async getUserById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async findOrCreateAdminUser() {
    const adminEmail = 'admin@local';
    let user = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin',
        },
      });
    }
    
    return user;
  }

  async validateAdminPassword(password: string): Promise<boolean> {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.warn('⚠️  ADMIN_PASSWORD not set in environment variables');
      return false;
    }
    return password === adminPassword;
  }
}

export const authService = new AuthService();
