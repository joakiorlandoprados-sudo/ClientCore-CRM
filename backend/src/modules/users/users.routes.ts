import { Role } from "@prisma/client";
import { Router } from "express";
import { authorize } from "../../middlewares/authorize";
import { asyncHandler } from "../../utils/async-handler";
import { usersController } from "./users.controller";

export const usersRouter = Router();

usersRouter.use(authorize(Role.ADMIN));
usersRouter.get("/", asyncHandler(usersController.list));
usersRouter.post("/", asyncHandler(usersController.create));
usersRouter.get("/:id", asyncHandler(usersController.get));
usersRouter.patch("/:id", asyncHandler(usersController.update));
usersRouter.delete("/:id", asyncHandler(usersController.deactivate));
