// @ts-ignore: npm module
import pkg from 'npm:@prisma/client@5.22.0';
const { PrismaClient } = pkg;
import { ManagerEntity, CreateManagerInput } from '../../../domain/entities/manager.entity.ts';
import { ManagerRole } from '../../../domain/enums/manager-role.enum.ts';

export class ManagerRepository {
  constructor(private readonly prisma: any) {}

  async create(data: CreateManagerInput): Promise<ManagerEntity> {
    return await this.prisma.manager.create({
      data: {
        email: data.email,
        password: data.password,
        role: data.role,
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

  async countAdmins(): Promise<number> {
    return await this.prisma.manager.count({
      where: { role: ManagerRole.ADMIN },
    });
  }

  async list(skip: number = 0, take: number = 50): Promise<ManagerEntity[]> {
    return await this.prisma.manager.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  async count(): Promise<number> {
    return await this.prisma.manager.count();
  }

  async findAllEmails(): Promise<string[]> {
    const managers = await this.prisma.manager.findMany({
      select: { email: true },
    });
    return managers.map((m: { email: string }) => m.email);
  }
}
