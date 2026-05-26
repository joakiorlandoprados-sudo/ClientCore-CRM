import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { validateDto } from "../../utils/validation";
import { CreateClientDto, UpdateClientDto } from "./clients.dtos";
import { clientsService } from "./clients.service";

export const clientsController = {
  async list(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await clientsService.list(req.user!, req.query));
  },

  async get(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await clientsService.get(req.user!, req.params.id));
  },

  async create(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(CreateClientDto, req.body);
    sendSuccess(res, await clientsService.create(req.user!, dto), "Client created", 201);
  },

  async update(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(UpdateClientDto, req.body, true);
    sendSuccess(res, await clientsService.update(req.user!, req.params.id, dto), "Client updated");
  },

  async delete(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await clientsService.delete(req.user!, req.params.id), "Client deleted");
  },

  async contacts(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await clientsService.contacts(req.user!, req.params.id));
  },

  async deals(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await clientsService.deals(req.user!, req.params.id));
  },

  async notes(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await clientsService.notes(req.user!, req.params.id));
  }
};
