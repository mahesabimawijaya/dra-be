import express from "express";
import { getMe, getUsers, login, logout, register } from "./auth";
import { auth } from "../middlewares/auth";
import { handleNotification, pay } from "./payment";

const router = express.Router();

//auth
router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);
router.post("/logout", logout);

//users
router.get("/users", auth, getUsers);

//payment
router.post("/payment", pay);
router.post("/payment/notification", handleNotification);

export default router;
