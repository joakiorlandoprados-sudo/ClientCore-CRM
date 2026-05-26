import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { dashboardService } from "./dashboard.service";

export const dashboardController = {
  async summary(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await dashboardService.summary(req.user!));
  },

  async pipeline(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await dashboardService.pipeline(req.user!));
  },

  async activity(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await dashboardService.activity(req.user!));
  }
};
