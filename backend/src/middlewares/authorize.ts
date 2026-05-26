import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { forbidden, unauthorized } from "../utils/http-error";

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(unauthorized());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(forbidden("You do not have permission to perform this action"));
      return;
    }

    next();
  };
}
