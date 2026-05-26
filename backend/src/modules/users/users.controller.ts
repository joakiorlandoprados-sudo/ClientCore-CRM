import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { validateDto } from "../../utils/validation";
import { CreateUserDto, UpdateUserDto } from "./users.dtos";
import { usersService } from "./users.service";

export const usersController = {
  async list(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, await usersService.list());
  },

  async get(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await usersService.get(req.params.id));
  },

  async create(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(CreateUserDto, req.body);
    sendSuccess(res, await usersService.create(dto), "User created", 201);
  },

  async update(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(UpdateUserDto, req.body, true);
    sendSuccess(res, await usersService.update(req.params.id, dto), "User updated");
  },

  async deactivate(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await usersService.deactivate(req.params.id), "User deactivated");
  }
};
