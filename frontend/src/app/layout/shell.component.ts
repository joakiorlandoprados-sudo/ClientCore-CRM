import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../core/services/auth.service";

interface NavItem {
  label: string;
  path: string;
  mark: string;
  adminOnly?: boolean;
}

@Component({
  selector: "cc-shell",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/dashboard" aria-label="ClientCore dashboard">
          <span class="brand-mark">C</span>
          <span>ClientCore</span>
        </a>

        <nav aria-label="Main navigation">
          @for (item of visibleNav(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }">
              <span class="nav-mark">{{ item.mark }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </aside>

      <main class="main">
        <header class="topbar">
          <div class="breadcrumbs" aria-label="Breadcrumbs">
            @for (crumb of breadcrumbs(); track crumb) {
              <span>{{ crumb }}</span>
            }
          </div>
          <div class="user-menu">
            <span>{{ auth.currentUser()?.name }}</span>
            <span class="role-pill">{{ auth.currentUser()?.role }}</span>
            <button type="button" class="icon-button" aria-label="Logout" title="Logout" (click)="auth.logout()">⇥</button>
          </div>
        </header>

        <section class="content">
          <router-outlet />
        </section>
      </main>
    </div>
  `
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly url = signal(this.router.url);

  readonly nav: NavItem[] = [
    { label: "Dashboard", path: "/dashboard", mark: "◆" },
    { label: "Clients", path: "/clients", mark: "◫" },
    { label: "Pipeline", path: "/deals", mark: "↦" },
    { label: "Tasks", path: "/tasks", mark: "✓" },
    { label: "Admin", path: "/admin", mark: "⚙", adminOnly: true }
  ];

  readonly visibleNav = computed(() => this.nav.filter((item) => !item.adminOnly || this.auth.isAdmin()));
  readonly breadcrumbs = computed(() =>
    this.url()
      .split("/")
      .filter(Boolean)
      .map((segment) => segment.replaceAll("-", " "))
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
  );

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.url.set(event.urlAfterRedirects);
      }
    });
  }
}
