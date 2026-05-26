import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { Role, User } from "../../core/models";
import { UsersService } from "../../core/services/users.service";
import { StatusPanelComponent } from "../../shared/status-panel.component";

@Component({
  selector: "cc-admin-users",
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule, StatusPanelComponent],
  template: `
    <div class="page-header">
      <div>
        <h1>Admin</h1>
        <p>User access, roles, and active accounts.</p>
      </div>
    </div>

    <section class="form-panel" style="margin-bottom: 18px;">
      <form class="form-grid" [formGroup]="form" (ngSubmit)="createUser()">
        <label>
          Name
          <input formControlName="name">
        </label>
        <label>
          Email
          <input type="email" formControlName="email">
        </label>
        <label>
          Password
          <input type="password" formControlName="password">
        </label>
        <label>
          Role
          <select formControlName="role">
            @for (role of roles; track role) {
              <option [value]="role">{{ role }}</option>
            }
          </select>
        </label>
        <div class="full toolbar">
          <button class="button" type="submit" [disabled]="form.invalid || saving()"><span aria-hidden="true">＋</span> Create user</button>
        </div>
      </form>
    </section>

    <section class="table-panel">
      @if (loading()) {
        <cc-status-panel title="Loading users" message="Fetching team members." />
      } @else if (users().length === 0) {
        <cc-status-panel title="No users" message="Create the first team member." />
      } @else {
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (user of users(); track user.id) {
              <tr>
                <td><strong>{{ user.name }}</strong></td>
                <td>{{ user.email }}</td>
                <td>
                  <select [value]="user.role" (change)="changeRole(user, $event)" [disabled]="user.isActive === false">
                    @for (role of roles; track role) {
                      <option [value]="role">{{ role }}</option>
                    }
                  </select>
                </td>
                <td><span class="badge">{{ user.isActive === false ? "INACTIVE" : "ACTIVE" }}</span></td>
                <td>{{ user.createdAt | date: "MMM d, y" }}</td>
                <td style="text-align: right;">
                  @if (user.isActive !== false) {
                    <button class="danger-button" type="button" (click)="deactivate(user)">Deactivate</button>
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
export class AdminUsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  readonly roles: Role[] = ["ADMIN", "MANAGER", "SALES"];
  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly form = this.fb.nonNullable.group({
    name: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    password: ["Password123!", [Validators.required, Validators.minLength(8)]],
    role: ["SALES" as Role, Validators.required]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.usersService
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({ next: (users) => this.users.set(users) });
  }

  createUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.usersService
      .create(this.form.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (user) => {
          this.users.update((users) => [user, ...users]);
          this.form.patchValue({ name: "", email: "", password: "Password123!", role: "SALES" });
        }
      });
  }

  changeRole(user: User, event: Event): void {
    const role = (event.target as HTMLSelectElement).value as Role;
    this.usersService.update(user.id, { role }).subscribe({
      next: (updated) => this.users.update((users) => users.map((item) => (item.id === updated.id ? updated : item)))
    });
  }

  deactivate(user: User): void {
    if (!confirm(`Deactivate ${user.name}?`)) {
      return;
    }
    this.usersService.deactivate(user.id).subscribe({
      next: (updated) => this.users.update((users) => users.map((item) => (item.id === updated.id ? updated : item)))
    });
  }
}
