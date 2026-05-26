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
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal("");
  readonly form = this.fb.nonNullable.group({
    email: ["admin@clientcore.dev", [Validators.required, Validators.email]],
    password: ["Password123!", Validators.required]
  });

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
