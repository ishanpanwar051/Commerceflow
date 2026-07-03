import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validators/auth';

const router = Router();
const controller = new AuthController();

router.post('/register', validate(registerSchema), controller.register.bind(controller));
router.post('/login', validate(loginSchema), controller.login.bind(controller));
router.post('/refresh', validate(refreshTokenSchema), controller.refresh.bind(controller));
router.post('/logout', authenticate, controller.logout.bind(controller));
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword.bind(controller));
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword.bind(controller));
router.post('/verify-email/:token', controller.verifyEmail.bind(controller));
router.post('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword.bind(controller));

export default router;
