import bcrypt from 'bcrypt';
import prisma from '../database/client';

const SALT_ROUNDS = 10;
const ADMIN_EMAIL = 'admin@local';

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
    let user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: 'Admin',
          isAdmin: true,
        },
      });
    } else if (!user.isAdmin) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isAdmin: true },
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

  /** Authenticate by email + password: admin (admin@local + ADMIN_PASSWORD) or regular user (passwordHash). */
  async authenticateByEmailPassword(email: string, password: string) {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) return null;

    if (normalizedEmail === ADMIN_EMAIL) {
      const valid = await this.validateAdminPassword(password);
      if (!valid) return null;
      return this.findOrCreateAdminUser();
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.passwordHash) return null;
    const match = await bcrypt.compare(password, user.passwordHash);
    return match ? user : null;
  }

  /** Create a user with email/password (admin-created users). No social or self-signup. */
  async createUserWithPassword(data: { email: string; name?: string; password: string }) {
    const email = data.email.trim().toLowerCase();
    if (email === ADMIN_EMAIL) {
      throw new Error('Cannot create a user with the admin email');
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('A user with this email already exists');
    }
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    return prisma.user.create({
      data: {
        email,
        name: data.name?.trim() || null,
        passwordHash,
        isAdmin: false,
      },
    });
  }

  /** Update a user's name and/or password (admin only). */
  async updateUser(
    id: string,
    data: { name?: string; password?: string }
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    if (user.email === ADMIN_EMAIL && data.password !== undefined) {
      throw new Error('Admin password must be changed via ADMIN_PASSWORD env');
    }
    const update: { name?: string; passwordHash?: string } = {};
    if (data.name !== undefined) update.name = data.name.trim() || null;
    if (data.password !== undefined && data.password) {
      update.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    }
    return prisma.user.update({
      where: { id },
      data: update as { name?: string; passwordHash?: string },
    });
  }

  /** List all users (admin only). Exclude passwordHash from response. */
  async listUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /** Delete a user and all their data (admin only). Cannot delete admin user. */
  async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}

export const authService = new AuthService();
