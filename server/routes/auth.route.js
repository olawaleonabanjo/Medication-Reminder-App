import { Router } from "express";
import { signUp, signIn, signOut, getMe } from "../controllers/auth.controller.js";
import protect from "../middlewares/authorize.js";

const router = Router();

router.post("/register", signUp);

router.post("/login", signIn);

router.post("/sign-out", signOut);

router.get('/me', protect, getMe);

export default router;
