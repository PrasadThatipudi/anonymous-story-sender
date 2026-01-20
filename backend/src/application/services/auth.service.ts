import bcrypt from 'bcrypt';
import { create, verify, getNumericDate } from 'djwt';
import { ManagerRepository } from '../../infrastructure/database/repositories/manager.repository.ts';
import { InvitationRepository } from '../../infrastructure/database/repositories/invitation.repository.ts';
import { LoginCredentials, JWTPayload, AuthResponse } from '../../domain/types/auth.types.ts';
import { getEnv } from '../../config/env.ts';

const BCRYPT_ROUNDS = 10;

export class AuthService {
  constructor(
    private readonly managerRepo: ManagerRepository,
    private readonly invitationRepo?: InvitationRepository
  ) {}

  private async getJWTKey(): Promise<CryptoKey> {
    const env = getEnv();
    const encoder = new TextEncoder();
    const keyData = encoder.encode(env.JWT_SECRET);
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, BCRYPT_ROUNDS as any);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async generateToken(managerId: string, email: string): Promise<string> {
    const env = getEnv();
    const key = await this.getJWTKey();

    const expiryHours = parseInt(env.JWT_EXPIRY.replace('h', ''), 10);
    const exp = getNumericDate(expiryHours * 3600);

    const payload: JWTPayload = {
      managerId,
      email,
      iat: getNumericDate(0),
      exp,
    };

    return await create({ alg: 'HS256', typ: 'JWT' }, payload, key);
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const key = await this.getJWTKey();
      const payload = await verify(token, key);
      
      return {
        managerId: payload.managerId as string,
        email: payload.email as string,
        iat: payload.iat as number,
        exp: payload.exp as number,
      };
    } catch (error) {
      throw new Error(`Invalid token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const manager = await this.managerRepo.findByEmail(credentials.email);

    if (!manager) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await this.comparePassword(credentials.password, manager.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = await this.generateToken(manager.id, manager.email);

    console.log({
      timestamp: new Date().toISOString(),
      level: 'AUDIT',
      message: 'Manager login successful',
      context: {
        managerId: manager.id,
        email: this.maskEmail(manager.email),
      },
    });

    return {
      token,
      manager: {
        id: manager.id,
        email: manager.email,
        role: manager.role,
      },
    };
  }

  async acceptInvitation(token: string, password: string): Promise<AuthResponse> {
    if (!this.invitationRepo) {
      throw new Error('Invitation repository not configured');
    }

    const invitation = await this.invitationRepo.findByToken(token);

    if (!invitation) {
      throw new Error('Invalid or expired invitation');
    }

    if (invitation.used) {
      throw new Error('Invitation has already been used');
    }

    const now = new Date();
    if (invitation.expiresAt < now) {
      throw new Error('Invitation has expired');
    }

    const emailExists = await this.managerRepo.emailExists(invitation.email);
    if (emailExists) {
      throw new Error('An account with this email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    const manager = await this.managerRepo.create({
      email: invitation.email,
      password: hashedPassword,
      role: invitation.role,
    });

    await this.invitationRepo.markAsUsed(invitation.id);

    const jwtToken = await this.generateToken(manager.id, manager.email);

    console.log({
      timestamp: new Date().toISOString(),
      level: 'AUDIT',
      message: 'Manager account created via invitation',
      context: {
        managerId: manager.id,
        email: this.maskEmail(manager.email),
        role: manager.role,
        invitedBy: this.maskEmail(invitation.createdBy.email),
      },
    });

    return {
      token: jwtToken,
      manager: {
        id: manager.id,
        email: manager.email,
        role: manager.role,
      },
    };
  }

  async getManagerById(id: string) {
    const manager = await this.managerRepo.findById(id);

    if (!manager) {
      throw new Error('Manager not found');
    }

    return {
      id: manager.id,
      email: manager.email,
      createdAt: manager.createdAt,
    };
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) {
      return `***@${domain}`;
    }
    return `${localPart.substring(0, 3)}***@${domain}`;
  }
}

