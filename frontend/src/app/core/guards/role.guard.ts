import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Role } from "../models";

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data["roles"] ?? []) as Role[];
  return auth.hasRole(roles) ? true : router.createUrlTree(["/dashboard"]);
};
