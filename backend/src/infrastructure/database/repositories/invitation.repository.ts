import { CreateInvitationInput, InvitationEntity, InvitationWithCreator } from '../../../domain/entities/invitation.entity.ts';

export class InvitationRepository {
  constructor(private readonly prisma: any) {}

  async create(data: CreateInvitationInput & { token: string; expiresAt: Date }): Promise<InvitationEntity> {
    return await this.prisma.invitation.create({
      data: {
        email: data.email,
        token: data.token,
        role: data.role,
        expiresAt: data.expiresAt,
        createdById: data.createdById,
      },
    });
  }

  async findByToken(token: string): Promise<InvitationWithCreator | null> {
    return await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findPendingByEmail(email: string): Promise<InvitationEntity | null> {
    const now = new Date();
    return await this.prisma.invitation.findFirst({
      where: {
        email,
        used: false,
        expiresAt: {
          gt: now,
        },
      },
    });
  }

  async markAsUsed(id: string): Promise<InvitationEntity> {
    return await this.prisma.invitation.update({
      where: { id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });
  }

  async listPending(skip: number = 0, take: number = 20): Promise<InvitationWithCreator[]> {
    const now = new Date();
    return await this.prisma.invitation.findMany({
      where: {
        used: false,
        expiresAt: {
          gt: now,
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  async countPending(): Promise<number> {
    const now = new Date();
    return await this.prisma.invitation.count({
      where: {
        used: false,
        expiresAt: {
          gt: now,
        },
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.invitation.delete({
      where: { id },
    });
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.invitation.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
        used: false,
      },
    });
    return result.count;
  }
}

