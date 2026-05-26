import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { validateDto } from "../../utils/validation";
import { CreateContactDto, UpdateContactDto } from "./contacts.dtos";
import { contactsService } from "./contacts.service";

export const contactsController = {
  async list(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await contactsService.list(req.user!));
  },

  async get(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await contactsService.get(req.user!, req.params.id));
  },

  async create(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(CreateContactDto, req.body);
    sendSuccess(res, await contactsService.create(req.user!, dto), "Contact created", 201);
  },

  async update(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(UpdateContactDto, req.body, true);
    sendSuccess(res, await contactsService.update(req.user!, req.params.id, dto), "Contact updated");
  },

  async delete(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await contactsService.delete(req.user!, req.params.id), "Contact deleted");
  }
};
