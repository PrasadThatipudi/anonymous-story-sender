import crypto from 'node:crypto';
import { InvitationRepository } from '../../infrastructure/database/repositories/invitation.repository.ts';
import { ManagerRepository } from '../../infrastructure/database/repositories/manager.repository.ts';
import { GmailClient } from '../../infrastructure/email/gmail.client.ts';
import { CreateInvitationDTO, InvitationResponseDTO } from '../dto/manager.dto.ts';
import { ManagerRole } from '../../domain/enums/manager-role.enum.ts';

export class ManagerService {
  constructor(
    private readonly invitationRepo: InvitationRepository,
    private readonly managerRepo: ManagerRepository,
    private readonly emailClient: GmailClient
  ) {}

  async createInvitation(
    data: CreateInvitationDTO,
    createdById: string
  ): Promise<InvitationResponseDTO> {
    const emailExists = await this.managerRepo.emailExists(data.email);
    if (emailExists) {
      throw new Error('A manager with this email already exists');
    }

    const pendingInvitation = await this.invitationRepo.findPendingByEmail(data.email);
    if (pendingInvitation) {
      throw new Error('A pending invitation for this email already exists');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const invitation = await this.invitationRepo.create({
      email: data.email,
      role: data.role,
      createdById,
      token,
      expiresAt,
    });

    const creator = await this.managerRepo.findById(createdById);
    if (!creator) {
      throw new Error('Creator not found');
    }

    await this.emailClient.sendInvitation(
      data.email,
      creator.email,
      data.role,
      token
    );

    console.log({
      timestamp: new Date().toISOString(),
      level: 'AUDIT',
      message: 'Invitation created',
      context: {
        inviteeEmail: this.maskEmail(data.email),
        role: data.role,
        createdBy: this.maskEmail(creator.email),
        expiresAt: expiresAt.toISOString(),
      },
    });

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt.toISOString(),
      used: invitation.used,
      usedAt: invitation.usedAt ? invitation.usedAt.toISOString() : null,
      createdBy: {
        email: creator.email,
      },
      createdAt: invitation.createdAt.toISOString(),
    };
  }

  async listInvitations(page: number = 1, limit: number = 20): Promise<{
    invitations: InvitationResponseDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [invitations, total] = await Promise.all([
      this.invitationRepo.listPending(skip, limit),
      this.invitationRepo.countPending(),
    ]);

    return {
      invitations: invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        expiresAt: inv.expiresAt.toISOString(),
        used: inv.used,
        usedAt: inv.usedAt ? inv.usedAt.toISOString() : null,
        createdBy: {
          email: inv.createdBy.email,
        },
        createdAt: inv.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async revokeInvitation(invitationId: string, requesterId: string): Promise<void> {
    const invitation = await this.invitationRepo.findByToken('');
    
    await this.invitationRepo.deleteById(invitationId);

    console.log({
      timestamp: new Date().toISOString(),
      level: 'AUDIT',
      message: 'Invitation revoked',
      context: {
        invitationId,
        revokedBy: requesterId,
      },
    });
  }

  async listManagers(page: number = 1, limit: number = 50): Promise<{
    managers: Array<{
      id: string;
      email: string;
      role: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [managers, total] = await Promise.all([
      this.managerRepo.list(skip, limit),
      this.managerRepo.count(),
    ]);

    return {
      managers: managers.map((mgr) => ({
        id: mgr.id,
        email: mgr.email,
        role: mgr.role,
        createdAt: mgr.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
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

