import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { asyncHandler } from "../../utils/async-handler";
import { authController } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.post("/logout-all", authenticate, asyncHandler(authController.logoutAll));
