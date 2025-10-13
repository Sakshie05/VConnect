import { Router } from "express";
import { addToHistory, getUserHistory, login, register } from "../controllers/UserController.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_activity").post(addToHistory);
router.route("/get_activities").get(getUserHistory);

export default router;