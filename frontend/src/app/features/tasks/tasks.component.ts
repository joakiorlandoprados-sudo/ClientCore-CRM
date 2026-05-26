import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { Client, Deal, PageResult, TASK_PRIORITIES, TASK_STATUSES, Task, TaskPriority, TaskStatus, User } from "../../core/models";
import { AuthService } from "../../core/services/auth.service";
import { ClientsService } from "../../core/services/clients.service";
import { DealsService } from "../../core/services/deals.service";
import { TasksService } from "../../core/services/tasks.service";
import { UsersService } from "../../core/services/users.service";
import { StatusPanelComponent } from "../../shared/status-panel.component";

@Component({
  selector: "cc-tasks",
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule, StatusPanelComponent],
  template: `
    <div class="page-header">
      <div>
        <h1>Tasks</h1>
        <p>Follow-ups, ownership, due dates, and completion.</p>
      </div>
    </div>

    <section class="form-panel" style="margin-bottom: 18px;">
      <form class="form-grid" [formGroup]="createForm" (ngSubmit)="createTask()">
        <label>
          Title
          <input formControlName="title">
        </label>
        <label>
          Due date
          <input type="date" formControlName="dueDate">
        </label>
        <label>
          Priority
          <select formControlName="priority">
            @for (priority of priorities; track priority) {
              <option [value]="priority">{{ priority }}</option>
            }
          </select>
        </label>
        <label>
          Status
          <select formControlName="status">
            @for (status of statuses; track status) {
              <option [value]="status">{{ status }}</option>
            }
          </select>
        </label>
        <label>
          Client
          <select formControlName="clientId">
            <option value="">None</option>
            @for (client of clients(); track client.id) {
              <option [value]="client.id">{{ client.companyName }}</option>
            }
          </select>
        </label>
        <label>
          Deal
          <select formControlName="dealId">
            <option value="">None</option>
            @for (deal of deals(); track deal.id) {
              <option [value]="deal.id">{{ deal.title }}</option>
            }
          </select>
        </label>
        @if (auth.isAdmin()) {
          <label>
            Assigned to
            <select formControlName="assignedToId">
              <option value="">Current user</option>
              @for (user of users(); track user.id) {
                <option [value]="user.id">{{ user.name }} · {{ user.role }}</option>
              }
            </select>
          </label>
        }
        <label class="full">
          Description
          <textarea formControlName="description"></textarea>
        </label>
        <div class="full toolbar">
          <button class="button" type="submit" [disabled]="createForm.invalid || saving()"><span aria-hidden="true">＋</span> Add task</button>
        </div>
      </form>
    </section>

    <section class="table-panel">
      <form class="toolbar" [formGroup]="filters" (ngSubmit)="load()">
        <select formControlName="status">
          <option value="">All statuses</option>
          @for (status of statuses; track status) {
            <option [value]="status">{{ status }}</option>
          }
        </select>
        <select formControlName="priority">
          <option value="">All priorities</option>
          @for (priority of priorities; track priority) {
            <option [value]="priority">{{ priority }}</option>
          }
        </select>
        <input type="date" formControlName="dueDate">
        <button class="button" type="submit"><span aria-hidden="true">⌕</span> Filter</button>
        <button class="ghost-button" type="button" (click)="resetFilters()">Reset</button>
      </form>

      @if (loading()) {
        <cc-status-panel title="Loading tasks" message="Fetching task list." />
      } @else if (tasks().length === 0) {
        <cc-status-panel title="No tasks found" message="Create a task or adjust the filters." />
      } @else {
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due</th>
              <th>Related</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (task of tasks(); track task.id) {
              <tr>
                <td>
                  <strong>{{ task.title }}</strong>
                  <div style="color: var(--muted);">{{ task.assignedTo?.name }}</div>
                </td>
                <td><span class="badge">{{ task.priority }}</span></td>
                <td><span class="badge">{{ task.status }}</span></td>
                <td>{{ task.dueDate | date: "MMM d, y" }}</td>
                <td>{{ task.client?.companyName || task.deal?.title || "—" }}</td>
                <td style="text-align: right;">
                  @if (task.status !== "DONE") {
                    <button class="button" type="button" (click)="complete(task)"><span aria-hidden="true">✓</span> Complete</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `
})
export class TasksComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tasksService = inject(TasksService);
  private readonly clientsService = inject(ClientsService);
  private readonly dealsService = inject(DealsService);
  private readonly usersService = inject(UsersService);
  readonly auth = inject(AuthService);

  readonly statuses = TASK_STATUSES;
  readonly priorities = TASK_PRIORITIES;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly tasks = signal<Task[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly deals = signal<Deal[]>([]);
  readonly users = signal<User[]>([]);
  readonly filters = this.fb.nonNullable.group({
    status: [""],
    priority: [""],
    dueDate: [""]
  });
  readonly createForm = this.fb.nonNullable.group({
    title: ["", Validators.required],
    description: [""],
    dueDate: [new Date().toISOString().slice(0, 10), Validators.required],
    status: ["PENDING", Validators.required],
    priority: ["MEDIUM", Validators.required],
    clientId: [""],
    dealId: [""],
    assignedToId: [""]
  });

  ngOnInit(): void {
    this.load();
    this.clientsService.list({ limit: 100 }).subscribe({ next: (result) => this.clients.set(result.items) });
    this.dealsService.list({ limit: 100 }).subscribe({ next: (result) => this.deals.set(result.items) });
    if (this.auth.isAdmin()) {
      this.usersService.list().subscribe({ next: (users) => this.users.set(users.filter((user) => user.isActive !== false)) });
    }
  }

  load(): void {
    const filters = this.filters.getRawValue();
    this.loading.set(true);
    this.tasksService
      .list({
        limit: 100,
        status: (filters.status || undefined) as TaskStatus | undefined,
        priority: (filters.priority || undefined) as TaskPriority | undefined,
        dueDate: filters.dueDate || undefined
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({ next: (result: PageResult<Task>) => this.tasks.set(result.items) });
  }

  resetFilters(): void {
    this.filters.reset();
    this.load();
  }

  createTask(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const raw = this.createForm.getRawValue();
    this.saving.set(true);
    this.tasksService
      .create({
        title: raw.title,
        description: raw.description,
        dueDate: new Date(raw.dueDate).toISOString(),
        status: raw.status as "PENDING" | "IN_PROGRESS" | "DONE",
        priority: raw.priority as "LOW" | "MEDIUM" | "HIGH",
        clientId: raw.clientId || undefined,
        dealId: raw.dealId || undefined,
        assignedToId: raw.assignedToId || undefined
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (task) => {
          this.tasks.update((tasks) => [task, ...tasks]);
          this.createForm.patchValue({ title: "", description: "", status: "PENDING", priority: "MEDIUM", clientId: "", dealId: "", assignedToId: "" });
        }
      });
  }

  complete(task: Task): void {
    this.tasksService.complete(task.id).subscribe({
      next: (updated) => this.tasks.update((tasks) => tasks.map((item) => (item.id === updated.id ? updated : item)))
    });
  }
}
