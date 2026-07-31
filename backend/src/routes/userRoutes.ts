import { Router } from 'express';
import multer from 'multer';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserSchema, addressSchema } from '../validators';

const router = Router();
const controller = new UserController();
const avatarUpload = multer({ dest: 'uploads/avatars/', limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticate);

router.get('/profile', controller.getProfile.bind(controller));
router.patch('/profile', validate(updateUserSchema), controller.updateProfile.bind(controller));
router.post('/avatar', avatarUpload.single('avatar'), controller.uploadAvatar.bind(controller));
router.delete('/account', controller.deleteAccount.bind(controller));

router.get('/addresses', controller.getAddresses.bind(controller));
router.post('/addresses', validate(addressSchema), controller.createAddress.bind(controller));
router.patch('/addresses/:id', validate(addressSchema), controller.updateAddress.bind(controller));
router.delete('/addresses/:id', controller.deleteAddress.bind(controller));

export default router;
