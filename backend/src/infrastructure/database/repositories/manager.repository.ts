import { PrismaClient } from '@prisma/client';
import { ManagerEntity, CreateManagerInput } from '../../../domain/entities/manager.entity.ts';

export class ManagerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateManagerInput): Promise<ManagerEntity> {
    return await this.prisma.manager.create({
      data: {
        email: data.email,
        password: data.password,
      },
    });
  }

  async findByEmail(email: string): Promise<ManagerEntity | null> {
    return await this.prisma.manager.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<ManagerEntity | null> {
    return await this.prisma.manager.findUnique({
      where: { id },
    });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.manager.count({
      where: { email },
    });
    return count > 0;
  }
}

