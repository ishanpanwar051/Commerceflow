import { Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/helpers';

const authService = new AuthService();

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 'Registration successful', 201);
    } catch (error) { next(error); }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (error) { next(error); }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error) { next(error); }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken;
      await authService.logout(req.user!.userId, refreshToken);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) { next(error); }
  }

  async forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      sendSuccess(res, null, 'If the email exists, a reset link has been sent');
    } catch (error) { next(error); }
  }

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      sendSuccess(res, null, 'Password reset successfully');
    } catch (error) { next(error); }
  }

  async verifyEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.verifyEmail(req.params.token as string);
      sendSuccess(res, null, 'Email verified successfully');
    } catch (error) { next(error); }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) { next(error); }
  }

  async resendVerification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.resendVerification(req.user!.userId);
      sendSuccess(res, null, 'Verification email sent');
    } catch (error) { next(error); }
  }
}
