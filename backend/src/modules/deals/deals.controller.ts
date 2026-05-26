import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { validateDto } from "../../utils/validation";
import { CreateDealDto, MoveDealStageDto, UpdateDealDto } from "./deals.dtos";
import { dealsService } from "./deals.service";

export const dealsController = {
  async list(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await dealsService.list(req.user!, req.query));
  },

  async get(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await dealsService.get(req.user!, req.params.id));
  },

  async create(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(CreateDealDto, req.body);
    sendSuccess(res, await dealsService.create(req.user!, dto), "Deal created", 201);
  },

  async update(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(UpdateDealDto, req.body, true);
    sendSuccess(res, await dealsService.update(req.user!, req.params.id, dto), "Deal updated");
  },

  async moveStage(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(MoveDealStageDto, req.body);
    sendSuccess(res, await dealsService.moveStage(req.user!, req.params.id, dto), "Deal stage updated");
  },

  async delete(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await dealsService.delete(req.user!, req.params.id), "Deal deleted");
  },

  async aggregate(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await dealsService.aggregate(req.user!));
  }
};
