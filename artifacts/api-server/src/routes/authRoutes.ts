import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter, forgotPasswordLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validators/auth';

const router = Router();
const controller = new AuthController();

router.post('/register', authLimiter, validate(registerSchema), controller.register.bind(controller));
router.post('/login', authLimiter, validate(loginSchema), controller.login.bind(controller));
router.post('/refresh', validate(refreshTokenSchema), controller.refresh.bind(controller));
router.post('/logout', authenticate, controller.logout.bind(controller));
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), controller.forgotPassword.bind(controller));
router.post('/reset-password', forgotPasswordLimiter, validate(resetPasswordSchema), controller.resetPassword.bind(controller));
router.post('/verify-email/:token', authLimiter, controller.verifyEmail.bind(controller));
router.post('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword.bind(controller));
router.post('/resend-verification', authenticate, controller.resendVerification.bind(controller));
router.post('/google', controller.googleLogin.bind(controller));

export default router;
