import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { Client, User } from "../../core/models";
import { AuthService } from "../../core/services/auth.service";
import { ClientsService } from "../../core/services/clients.service";
import { UsersService } from "../../core/services/users.service";
import { StatusPanelComponent } from "../../shared/status-panel.component";

@Component({
  selector: "cc-client-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StatusPanelComponent],
  template: `
    <div class="page-header">
      <div>
        <h1>{{ clientId() ? "Edit client" : "New client" }}</h1>
        <p>{{ clientId() ? "Update account details and ownership." : "Create a client account." }}</p>
      </div>
      <a class="ghost-button" routerLink="/clients">Back</a>
    </div>

    @if (loading()) {
      <cc-status-panel title="Loading client" message="Fetching account details." />
    } @else {
      <form class="form-panel" [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-grid">
          <label>
            Company name
            <input formControlName="companyName">
            @if (form.controls.companyName.touched && form.controls.companyName.invalid) {
              <span class="error-text">Company name is required.</span>
            }
          </label>

          <label>
            Industry
            <input formControlName="industry">
            @if (form.controls.industry.touched && form.controls.industry.invalid) {
              <span class="error-text">Industry is required.</span>
            }
          </label>

          <label>
            Website
            <input formControlName="website" placeholder="https://example.com">
          </label>

          <label>
            Phone
            <input formControlName="phone">
          </label>

          <label class="full">
            Address
            <textarea formControlName="address"></textarea>
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
        </div>

        @if (error()) {
          <p class="error-text">{{ error() }}</p>
        }

        <div class="toolbar" style="margin: 18px 0 0;">
          <button class="button" type="submit" [disabled]="saving()">
            <span aria-hidden="true">✓</span>
            {{ saving() ? "Saving" : "Save client" }}
          </button>
          <a class="ghost-button" routerLink="/clients">Cancel</a>
        </div>
      </form>
    }
  `
})
export class ClientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientsService = inject(ClientsService);
  private readonly usersService = inject(UsersService);
  readonly auth = inject(AuthService);

  readonly clientId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal("");
  readonly users = signal<User[]>([]);
  readonly form = this.fb.nonNullable.group({
    companyName: ["", Validators.required],
    industry: ["", Validators.required],
    website: [""],
    phone: [""],
    address: [""],
    assignedToId: [""]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    this.clientId.set(id);
    if (this.auth.isAdmin()) {
      this.usersService.list().subscribe({ next: (users) => this.users.set(users.filter((user) => user.isActive !== false)) });
    }
    if (id) {
      this.loading.set(true);
      this.clientsService
        .get(id)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({ next: (client) => this.patchForm(client) });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      companyName: raw.companyName,
      industry: raw.industry,
      website: raw.website,
      phone: raw.phone,
      address: raw.address,
      assignedToId: raw.assignedToId || undefined
    };

    this.saving.set(true);
    this.error.set("");
    const request = this.clientId()
      ? this.clientsService.update(this.clientId()!, payload)
      : this.clientsService.create(payload);

    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (client) => void this.router.navigate(["/clients", client.id]),
      error: () => this.error.set("Client could not be saved.")
    });
  }

  private patchForm(client: Client): void {
    this.form.patchValue({
      companyName: client.companyName,
      industry: client.industry,
      website: client.website ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      assignedToId: client.assignedToId
    });
  }
}
