import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { Role, User } from "../models";

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  isActive?: boolean;
}

@Injectable({ providedIn: "root" })
export class UsersService {
  private readonly api = inject(ApiService);

  list(): Observable<User[]> {
    return this.api.get<User[]>("/users");
  }

  create(body: CreateUserRequest): Observable<User> {
    return this.api.post<User, CreateUserRequest>("/users", body);
  }

  update(id: string, body: UpdateUserRequest): Observable<User> {
    return this.api.patch<User, UpdateUserRequest>(`/users/${id}`, body);
  }

  deactivate(id: string): Observable<User> {
    return this.api.delete<User>(`/users/${id}`);
  }
}
