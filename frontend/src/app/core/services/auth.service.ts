import { Injectable, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";
import { ApiService } from "./api.service";
import { AuthPayload, Role, User } from "../models";

interface LoginRequest {
  email: string;
  password: string;
}

const ACCESS_KEY = "clientcore.accessToken";
const REFRESH_KEY = "clientcore.refreshToken";
const USER_KEY = "clientcore.user";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly currentUser = signal<User | null>(this.loadUser());
  readonly isAuthenticated = computed(() => Boolean(this.currentUser() && this.accessToken()));
  readonly isAdmin = computed(() => this.currentUser()?.role === "ADMIN");

  login(credentials: LoginRequest): Observable<AuthPayload> {
    return this.api.post<AuthPayload, LoginRequest>("/auth/login", credentials).pipe(tap((payload) => this.persist(payload)));
  }

  refresh(): Observable<AuthPayload> {
    const refreshToken = this.refreshToken();
    return this.api
      .post<AuthPayload, { refreshToken: string }>("/auth/refresh", { refreshToken: refreshToken ?? "" })
      .pipe(tap((payload) => this.persist(payload)));
  }

  logout(): void {
    const refreshToken = this.refreshToken();
    if (refreshToken) {
      this.api.post<{ revoked: boolean }, { refreshToken: string }>("/auth/logout", { refreshToken }).subscribe();
    }
    this.clearSession();
    void this.router.navigateByUrl("/login");
  }

  hasRole(roles: Role[]): boolean {
    const role = this.currentUser()?.role;
    return Boolean(role && roles.includes(role));
  }

  accessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  refreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  private persist(payload: AuthPayload): void {
    localStorage.setItem(ACCESS_KEY, payload.accessToken);
    localStorage.setItem(REFRESH_KEY, payload.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    this.currentUser.set(payload.user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
}
