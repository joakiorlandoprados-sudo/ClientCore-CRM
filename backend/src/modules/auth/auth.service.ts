import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../../config/env";
import { AuthenticatedUser } from "../../types/api";
import { badRequest, unauthorized } from "../../utils/http-error";
import { LoginDto, LogoutDto, RefreshDto, RegisterDto } from "./auth.dtos";
import { authRepository } from "./auth.repository";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult extends AuthTokens {
  user: AuthenticatedUser;
}

interface RefreshPayload extends jwt.JwtPayload {
  sub: string;
  tokenType: "refresh";
}

function tokenHash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseExpiration(value: string): Date {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = unit === "s" ? 1000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
  return new Date(Date.now() + amount * multiplier);
}

function signAccessToken(user: AuthenticatedUser): string {
  return jwt.sign(
    { email: user.email, role: user.role },
    env.jwtAccessSecret,
    { subject: user.id, expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions["expiresIn"] }
  );
}

function signRefreshToken(userId: string): string {
  return jwt.sign(
    { tokenType: "refresh" },
    env.jwtRefreshSecret,
    { subject: userId, expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions["expiresIn"] }
  );
}

function toAuthenticatedUser(user: { id: string; name: string; email: string; role: Role }): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

async function issueTokens(user: AuthenticatedUser): Promise<AuthTokens> {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user.id);
  await authRepository.createRefreshToken(user.id, tokenHash(refreshToken), parseExpiration(env.jwtRefreshExpiresIn));
  return { accessToken, refreshToken };
}

function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = jwt.verify(token, env.jwtRefreshSecret);
  if (typeof decoded === "string" || decoded.tokenType !== "refresh" || typeof decoded.sub !== "string") {
    throw unauthorized("Invalid refresh token");
  }
  return decoded as RefreshPayload;
}

export const authService = {
  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await authRepository.findUserByEmail(dto.email.toLowerCase());
    if (existing) {
      throw badRequest("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const created = await authRepository.createUser({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: Role.SALES
    });
    const user = toAuthenticatedUser(created);
    return { user, ...(await issueTokens(user)) };
  },

  async login(dto: LoginDto): Promise<AuthResult> {
    const userRecord = await authRepository.findUserByEmail(dto.email.toLowerCase());
    if (!userRecord || !userRecord.isActive) {
      throw unauthorized("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(dto.password, userRecord.passwordHash);
    if (!validPassword) {
      throw unauthorized("Invalid credentials");
    }

    const user = toAuthenticatedUser(userRecord);
    return { user, ...(await issueTokens(user)) };
  },

  async refresh(dto: RefreshDto): Promise<AuthResult> {
    const decoded = verifyRefreshToken(dto.refreshToken);
    const hash = tokenHash(dto.refreshToken);
    const stored = await authRepository.findRefreshToken(hash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== decoded.sub || !stored.user.isActive) {
      throw unauthorized("Refresh token is no longer valid");
    }

    await authRepository.revokeRefreshToken(hash);
    const user = toAuthenticatedUser(stored.user);
    return { user, ...(await issueTokens(user)) };
  },

  async logout(dto: LogoutDto): Promise<{ revoked: boolean }> {
    const hash = tokenHash(dto.refreshToken);
    await authRepository.revokeRefreshToken(hash);
    return { revoked: true };
  },

  async logoutAll(user: AuthenticatedUser): Promise<{ revoked: boolean }> {
    await authRepository.revokeAllUserRefreshTokens(user.id);
    return { revoked: true };
  }
};
