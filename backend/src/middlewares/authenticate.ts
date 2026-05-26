import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { unauthorized } from "../utils/http-error";

interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

function isAccessTokenPayload(payload: string | jwt.JwtPayload): payload is jwt.JwtPayload & AccessTokenPayload {
  return typeof payload !== "string" && typeof payload.sub === "string";
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

    if (!token) {
      throw unauthorized("Missing access token");
    }

    const decoded = jwt.verify(token, env.jwtAccessSecret);
    if (!isAccessTokenPayload(decoded)) {
      throw unauthorized("Invalid access token");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      throw unauthorized("User is not active");
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    next(error instanceof Error && error.name === "JsonWebTokenError" ? unauthorized("Invalid access token") : error);
  }
}
