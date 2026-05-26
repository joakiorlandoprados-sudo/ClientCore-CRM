import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { HttpError } from "../utils/http-error";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      success: false,
      data: null,
      message: error.message,
      details: error.details
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const statusCode = error.code === "P2025" ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      data: null,
      message: "Database request failed",
      details: { code: error.code, meta: error.meta }
    });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  return res.status(500).json({
    success: false,
    data: null,
    message
  });
}
