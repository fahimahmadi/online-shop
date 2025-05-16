import {Router} from 'express';
import { activateAccount, register, login } from '../controllers/users.js';
import { validateRegisterData } from '../middlewares/validations/users.js';
const router = Router();


/* ------------------- USER ------------------- */
router.post("/register", validateRegisterData, register);
router.get("/activate/:token", activateAccount);
router.post("/login", login);

export default router;