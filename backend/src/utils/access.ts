import { Role } from "@prisma/client";
import { AuthenticatedUser } from "../types/api";

export function canViewAll(user: AuthenticatedUser): boolean {
  return user.role === Role.ADMIN || user.role === Role.MANAGER;
}

export function canDeleteBusinessRecords(user: AuthenticatedUser): boolean {
  return user.role === Role.ADMIN || user.role === Role.MANAGER;
}
