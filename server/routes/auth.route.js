import { Router } from "express";
import { signUp, signIn, signOut } from "../controllers/auth.controller.js";

const router = Router();

router.post("/sign-up", signUp);

router.post("/sign-in", signIn);

router.post("/sign-in", signOut);

export default router;
