import { PrismaClient, Prisma } from '@prisma/client';
import { getPrisma } from '../config/database';

export class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected model: Prisma.ModelName;

  constructor(modelName: Prisma.ModelName) {
    this.prisma = getPrisma();
    this.model = modelName;
  }

  protected get delegate(): any {
    return (this.prisma as any)[this.model.charAt(0).toLowerCase() + this.model.slice(1)];
  }
}
