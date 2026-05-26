import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { contactsController } from "./contacts.controller";

export const contactsRouter = Router();

contactsRouter.get("/", asyncHandler(contactsController.list));
contactsRouter.post("/", asyncHandler(contactsController.create));
contactsRouter.get("/:id", asyncHandler(contactsController.get));
contactsRouter.patch("/:id", asyncHandler(contactsController.update));
contactsRouter.delete("/:id", asyncHandler(contactsController.delete));
