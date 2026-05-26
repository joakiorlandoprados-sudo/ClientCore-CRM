import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { PageResult, Task, TaskPriority, TaskStatus } from "../models";

export interface TaskRequest {
  title: string;
  description?: string;
  dueDate: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  dealId?: string;
  clientId?: string;
}

export interface TaskQuery {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
}

@Injectable({ providedIn: "root" })
export class TasksService {
  private readonly api = inject(ApiService);

  list(query: TaskQuery = {}): Observable<PageResult<Task>> {
    return this.api.get<PageResult<Task>>("/tasks", query);
  }

  create(body: TaskRequest): Observable<Task> {
    return this.api.post<Task, TaskRequest>("/tasks", body);
  }

  update(id: string, body: Partial<TaskRequest>): Observable<Task> {
    return this.api.patch<Task, Partial<TaskRequest>>(`/tasks/${id}`, body);
  }

  complete(id: string): Observable<Task> {
    return this.api.patch<Task, Record<string, never>>(`/tasks/${id}/complete`, {});
  }
}
