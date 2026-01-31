import { Router } from "express";
import { createUser, listUsers } from "../controllers/user.controller.js";

const router = Router();

router.post("/", createUser);
router.get("/", listUsers);

export default router;
