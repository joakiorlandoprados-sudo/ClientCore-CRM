import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { finalize } from "rxjs";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "cc-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="login-screen">
      <form class="login-card" [formGroup]="form" (ngSubmit)="submit()">
        <h1>ClientCore</h1>
        <p>Sign in to manage clients, pipeline, and tasks.</p>

        <div class="demo-banner">
          <span>🔍 Portfolio demo</span>
          <button type="button" class="demo-btn" (click)="fillDemo()">
            Access as Admin
          </button>
        </div>

        <div class="grid">
          <label>
            Email
            <input type="email" formControlName="email" autocomplete="email">
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <span class="error-text">Enter a valid email.</span>
            }
          </label>
          <label>
            Password
            <input type="password" formControlName="password" autocomplete="current-password">
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <span class="error-text">Password is required.</span>
            }
          </label>
          @if (error()) {
            <span class="error-text">{{ error() }}</span>
          }
          <button class="button" type="submit" [disabled]="loading()">
            <span aria-hidden="true">↪</span>
            {{ loading() ? "Signing in" : "Sign in" }}
          </button>
        </div>
      </form>
    </main>
  `,
  styles: [`
    .demo-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f0faf5;
      border: 1px solid #b2dfcc;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 16px;
      font-size: 0.85rem;
      color: #2d6a4f;
    }
    .demo-btn {
      background: #1a7a4a;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 6px 14px;
      font-size: 0.82rem;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }
    .demo-btn:hover {
      background: #145c38;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal("");

  readonly form = this.fb.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", Validators.required]
  });

  fillDemo(): void {
    this.form.setValue({ email: "admin@clientcore.dev", password: "Password123!" });
    this.submit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set("");
    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl("/dashboard"),
        error: () => this.error.set("Invalid credentials or unavailable API.")
      });
  }
}