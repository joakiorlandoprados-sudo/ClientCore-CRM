import { Role } from "@prisma/client";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
