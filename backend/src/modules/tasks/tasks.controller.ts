import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { validateDto } from "../../utils/validation";
import { CreateTaskDto, UpdateTaskDto } from "./tasks.dtos";
import { tasksService } from "./tasks.service";

export const tasksController = {
  async list(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await tasksService.list(req.user!, req.query));
  },

  async get(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await tasksService.get(req.user!, req.params.id));
  },

  async create(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(CreateTaskDto, req.body);
    sendSuccess(res, await tasksService.create(req.user!, dto), "Task created", 201);
  },

  async update(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(UpdateTaskDto, req.body, true);
    sendSuccess(res, await tasksService.update(req.user!, req.params.id, dto), "Task updated");
  },

  async complete(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await tasksService.complete(req.user!, req.params.id), "Task completed");
  },

  async delete(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await tasksService.delete(req.user!, req.params.id), "Task deleted");
  }
};
