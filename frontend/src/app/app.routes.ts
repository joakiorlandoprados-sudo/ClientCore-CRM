import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { roleGuard } from "./core/guards/role.guard";
import { ShellComponent } from "./layout/shell.component";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./features/auth/login.component").then((m) => m.LoginComponent)
  },
  {
    path: "",
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "dashboard"
      },
      {
        path: "dashboard",
        title: "Dashboard",
        loadComponent: () => import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent)
      },
      {
        path: "clients",
        title: "Clients",
        loadComponent: () => import("./features/clients/clients-list.component").then((m) => m.ClientsListComponent)
      },
      {
        path: "clients/new",
        title: "New client",
        loadComponent: () => import("./features/clients/client-form.component").then((m) => m.ClientFormComponent)
      },
      {
        path: "clients/:id",
        title: "Client detail",
        loadComponent: () => import("./features/clients/client-detail.component").then((m) => m.ClientDetailComponent)
      },
      {
        path: "clients/:id/edit",
        title: "Edit client",
        loadComponent: () => import("./features/clients/client-form.component").then((m) => m.ClientFormComponent)
      },
      {
        path: "deals",
        title: "Pipeline",
        loadComponent: () => import("./features/deals/deals-kanban.component").then((m) => m.DealsKanbanComponent)
      },
      {
        path: "tasks",
        title: "Tasks",
        loadComponent: () => import("./features/tasks/tasks.component").then((m) => m.TasksComponent)
      },
      {
        path: "admin",
        title: "Admin",
        canActivate: [roleGuard],
        data: { roles: ["ADMIN"] },
        loadComponent: () => import("./features/admin/admin-users.component").then((m) => m.AdminUsersComponent)
      }
    ]
  },
  { path: "**", redirectTo: "dashboard" }
];
