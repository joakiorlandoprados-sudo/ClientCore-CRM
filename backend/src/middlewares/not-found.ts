import { Request, Response } from "express";

export function notFoundHandler(req: Request, res: Response): Response {
  return res.status(404).json({
    success: false,
    data: null,
    message: `Route ${req.method} ${req.path} not found`
  });
}
