import { UserRepository } from '../repositories';
import { NotFoundError } from '../utils/errors';
import { logger } from '../config/logger';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId, true);
    if (!user) throw new NotFoundError('User');
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string }) {
    const user = await this.userRepo.update(userId, data);
    return this.sanitizeUser(user);
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.userRepo.update(userId, { avatar: avatarUrl });
    return this.sanitizeUser(user);
  }

  async deleteAccount(userId: string) {
    await this.userRepo.softDelete(userId);
    logger.info({ userId }, 'User account deleted');
  }

  async getAddresses(userId: string) {
    return this.userRepo.findAddresses(userId);
  }

  async createAddress(userId: string, data: any) {
    return this.userRepo.createAddress(userId, data);
  }

  async updateAddress(userId: string, addressId: string, data: any) {
    const address = await this.userRepo.updateAddress(addressId, userId, data);
    if (!address) throw new NotFoundError('Address');
    return address;
  }

  async deleteAddress(userId: string, addressId: string) {
    const result = await this.userRepo.deleteAddress(addressId, userId);
    if (!result) throw new NotFoundError('Address');
  }

  private sanitizeUser(user: any) {
    const { password, emailToken, resetToken, resetTokenExp, deletedAt, ...safe } = user;
    return safe;
  }
}
