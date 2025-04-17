import express from "express";
import { getMe, getUsers, login, logout, register } from "./auth";
import { auth } from "../middlewares/auth";

const router = express.Router();

//auth
router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);
router.post("/logout", logout);

//users
router.get("/users", auth, getUsers);

export default router;
