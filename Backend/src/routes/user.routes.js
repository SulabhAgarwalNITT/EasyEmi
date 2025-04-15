import { Router } from "express";
import { 
    registerUser,
    loginUser,
    logoutUser,
    changePassword
 } from "../controllers/user.controllers.js";
 import { veriftJWt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").get(veriftJWt, logoutUser)
router.route("/changePassword").post(veriftJWt, changePassword)

export default router