import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { Client, PageResult } from "../../core/models";
import { AuthService } from "../../core/services/auth.service";
import { ClientsService } from "../../core/services/clients.service";
import { StatusPanelComponent } from "../../shared/status-panel.component";

@Component({
  selector: "cc-clients-list",
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule, RouterLink, StatusPanelComponent],
  template: `
    <div class="page-header">
      <div>
        <h1>Clients</h1>
        <p>Accounts, ownership, and relationship coverage.</p>
      </div>
      <a class="button" routerLink="/clients/new"><span aria-hidden="true">＋</span> New client</a>
    </div>

    <section class="table-panel">
      <form class="toolbar" [formGroup]="filters" (ngSubmit)="load()">
        <input type="search" placeholder="Search company" formControlName="search">
        <input type="text" placeholder="Industry" formControlName="industry">
        <button class="button" type="submit"><span aria-hidden="true">⌕</span> Search</button>
        <button class="ghost-button" type="button" (click)="reset()">Reset</button>
      </form>

      @if (loading()) {
        <cc-status-panel title="Loading clients" message="Fetching client records." />
      } @else if (clients().length === 0) {
        <cc-status-panel title="No clients found" message="Create a client or adjust the current filters." />
      } @else {
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Industry</th>
              <th>Owner</th>
              <th>Created</th>
              <th>Coverage</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (client of clients(); track client.id) {
              <tr>
                <td><a [routerLink]="['/clients', client.id]"><strong>{{ client.companyName }}</strong></a></td>
                <td>{{ client.industry }}</td>
                <td>{{ client.assignedTo?.name || "Unassigned" }}</td>
                <td>{{ client.createdAt | date: "MMM d, y" }}</td>
                <td>
                  <span class="badge">{{ client._count?.contacts ?? 0 }} contacts</span>
                  <span class="badge">{{ client._count?.deals ?? 0 }} deals</span>
                </td>
                <td style="text-align: right;">
                  <a class="ghost-button" [routerLink]="['/clients', client.id, 'edit']">Edit</a>
                  @if (auth.currentUser()?.role !== "SALES") {
                    <button class="danger-button" type="button" (click)="deleteClient(client)">Delete</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div class="toolbar" style="justify-content: space-between; margin: 16px 0 0;">
          <span>{{ total() }} clients</span>
          <div style="display: flex; gap: 8px;">
            <button class="ghost-button" type="button" [disabled]="page() === 1" (click)="changePage(-1)">Previous</button>
            <button class="ghost-button" type="button" [disabled]="clients().length < limit" (click)="changePage(1)">Next</button>
          </div>
        </div>
      }
    </section>
  `
})
export class ClientsListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientsService = inject(ClientsService);
  readonly auth = inject(AuthService);

  readonly limit = 10;
  readonly loading = signal(false);
  readonly clients = signal<Client[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly filters = this.fb.nonNullable.group({
    search: [""],
    industry: [""]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const filters = this.filters.getRawValue();
    this.clientsService
      .list({ page: this.page(), limit: this.limit, search: filters.search, industry: filters.industry })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result: PageResult<Client>) => {
          this.clients.set(result.items);
          this.total.set(result.total);
        }
      });
  }

  reset(): void {
    this.filters.reset();
    this.page.set(1);
    this.load();
  }

  changePage(delta: number): void {
    this.page.update((page) => Math.max(1, page + delta));
    this.load();
  }

  deleteClient(client: Client): void {
    if (!confirm(`Delete ${client.companyName}?`)) {
      return;
    }
    this.clientsService.delete(client.id).subscribe({ next: () => this.load() });
  }
}
