import { Router } from "express";
import { createAvailability } from "../controllers/availability.controller.js";

const router = Router();

router.post("/", createAvailability);

export default router;