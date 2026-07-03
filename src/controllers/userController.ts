import { Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';

const userService = new UserService();

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.userId);
      sendSuccess(res, user, 'Profile fetched successfully');
    } catch (error) { next(error); }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) { next(error); }
  }

  async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const avatarUrl = req.body.url;
      if (!avatarUrl) return sendSuccess(res, null, 'No avatar provided');
      const user = await userService.updateAvatar(req.user!.userId, avatarUrl);
      sendSuccess(res, user, 'Avatar updated successfully');
    } catch (error) { next(error); }
  }

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.deleteAccount(req.user!.userId);
      sendSuccess(res, null, 'Account deleted successfully');
    } catch (error) { next(error); }
  }

  async getAddresses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addresses = await userService.getAddresses(req.user!.userId);
      sendSuccess(res, addresses, 'Addresses fetched successfully');
    } catch (error) { next(error); }
  }

  async createAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const address = await userService.createAddress(req.user!.userId, req.body);
      sendSuccess(res, address, 'Address created successfully', 201);
    } catch (error) { next(error); }
  }

  async updateAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const address = await userService.updateAddress(req.user!.userId, req.params.id as string, req.body);
      sendSuccess(res, address, 'Address updated successfully');
    } catch (error) { next(error); }
  }

  async deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.deleteAddress(req.user!.userId, req.params.id as string);
      sendSuccess(res, null, 'Address deleted successfully');
    } catch (error) { next(error); }
  }
}
