import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { validateDto } from "../../utils/validation";
import { LoginDto, LogoutDto, RefreshDto, RegisterDto } from "./auth.dtos";
import { authService } from "./auth.service";

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(RegisterDto, req.body);
    sendSuccess(res, await authService.register(dto), "Registration successful", 201);
  },

  async login(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(LoginDto, req.body);
    sendSuccess(res, await authService.login(dto), "Login successful");
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(RefreshDto, req.body);
    sendSuccess(res, await authService.refresh(dto), "Token refreshed");
  },

  async logout(req: Request, res: Response): Promise<void> {
    const dto = await validateDto(LogoutDto, req.body);
    sendSuccess(res, await authService.logout(dto), "Logout successful");
  },

  async logoutAll(req: Request, res: Response): Promise<void> {
    sendSuccess(res, await authService.logoutAll(req.user!), "All sessions revoked");
  }
};
