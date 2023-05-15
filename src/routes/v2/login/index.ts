import express from "express";
import loginController, {sessionTester} from '@/controllers/user/login'

const router = express.Router();

// router.get("/session", sessionTester);
router.post("/", loginController);

export default router;