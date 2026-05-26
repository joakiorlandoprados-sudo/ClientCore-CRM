import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { Client, DEAL_STAGES, Deal, DealStage, User } from "../../core/models";
import { AuthService } from "../../core/services/auth.service";
import { ClientsService } from "../../core/services/clients.service";
import { DealsService } from "../../core/services/deals.service";
import { UsersService } from "../../core/services/users.service";
import { StatusPanelComponent } from "../../shared/status-panel.component";

type DealGroups = Record<DealStage, Deal[]>;

function emptyGroups(): DealGroups {
  return DEAL_STAGES.reduce((groups, stage) => ({ ...groups, [stage]: [] }), {} as DealGroups);
}

@Component({
  selector: "cc-deals-kanban",
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, DragDropModule, ReactiveFormsModule, StatusPanelComponent],
  styles: [
    `
      .kanban {
        display: grid;
        grid-template-columns: repeat(6, minmax(240px, 1fr));
        gap: 14px;
        overflow-x: auto;
        padding-bottom: 8px;
      }

      .stage {
        min-height: 520px;
        background: var(--panel-alt);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 12px;
      }

      .stage header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .deal-list {
        min-height: 430px;
        display: grid;
        align-content: start;
        gap: 10px;
      }

      .deal-card {
        background: white;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 12px;
        display: grid;
        gap: 8px;
        cursor: grab;
      }

      .deal-card:active {
        cursor: grabbing;
      }

      .deal-meta {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        color: var(--muted);
        font-size: 0.84rem;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 40;
        background: rgba(20, 28, 24, 0.42);
        display: grid;
        place-items: center;
        padding: 20px;
      }

      .modal {
        width: min(560px, 100%);
        padding: 20px;
      }

      @media (max-width: 1200px) {
        .kanban {
          grid-template-columns: repeat(6, 260px);
        }
      }
    `
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Pipeline</h1>
        <p>Move deals through stage progression.</p>
      </div>
    </div>

    <section class="form-panel" style="margin-bottom: 18px;">
      <form class="form-grid" [formGroup]="form" (ngSubmit)="createDeal()">
        <label>
          Title
          <input formControlName="title">
        </label>
        <label>
          Value
          <input type="number" min="0" formControlName="value">
        </label>
        <label>
          Client
          <select formControlName="clientId">
            <option value="">Select client</option>
            @for (client of clients(); track client.id) {
              <option [value]="client.id">{{ client.companyName }}</option>
            }
          </select>
        </label>
        <label>
          Stage
          <select formControlName="stage">
            @for (stage of stages; track stage) {
              <option [value]="stage">{{ stage }}</option>
            }
          </select>
        </label>
        <label>
          Close date
          <input type="date" formControlName="expectedCloseDate">
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
        <div class="full toolbar">
          <button class="button" type="submit" [disabled]="form.invalid || saving()"><span aria-hidden="true">＋</span> Add deal</button>
        </div>
      </form>
    </section>

    @if (loading()) {
      <cc-status-panel title="Loading pipeline" message="Fetching opportunities." />
    } @else {
      <section class="kanban">
        @for (stage of stages; track stage) {
          <article class="stage">
            <header>
              <strong>{{ stage }}</strong>
              <span class="badge">{{ grouped()[stage].length }}</span>
            </header>
            <div
              class="deal-list"
              cdkDropList
              [id]="stage"
              [cdkDropListData]="grouped()[stage]"
              [cdkDropListConnectedTo]="stages"
              (cdkDropListDropped)="drop($event, stage)"
            >
              @for (deal of grouped()[stage]; track deal.id) {
                <article class="deal-card" cdkDrag (click)="selected.set(deal)">
                  <strong>{{ deal.title }}</strong>
                  <span>{{ deal.client?.companyName }}</span>
                  <div class="deal-meta">
                    <span>{{ +deal.value | currency }}</span>
                    <span>{{ deal.expectedCloseDate | date: "MMM d" }}</span>
                  </div>
                  <div class="deal-meta">
                    <span>{{ deal.assignedTo?.name }}</span>
                    <span class="badge">{{ deal.stage }}</span>
                  </div>
                </article>
              }
            </div>
          </article>
        }
      </section>
    }

    @if (selected(); as deal) {
      <div class="modal-backdrop" (click)="selected.set(null)">
        <article class="modal" (click)="$event.stopPropagation()">
          <div class="page-header" style="margin-bottom: 12px;">
            <div>
              <h2>{{ deal.title }}</h2>
              <p>{{ deal.client?.companyName }} · {{ deal.assignedTo?.name }}</p>
            </div>
            <button class="icon-button" type="button" aria-label="Close" title="Close" (click)="selected.set(null)">×</button>
          </div>
          <div class="form-grid">
            <p><strong>Value</strong><br>{{ +deal.value | currency }}</p>
            <p><strong>Expected close</strong><br>{{ deal.expectedCloseDate | date: "MMM d, y" }}</p>
            <label class="full">
              Stage
              <select [value]="deal.stage" (change)="moveFromModal(deal, $event)">
                @for (stage of stages; track stage) {
                  <option [value]="stage">{{ stage }}</option>
                }
              </select>
            </label>
          </div>
        </article>
      </div>
    }
  `
})
export class DealsKanbanComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dealsService = inject(DealsService);
  private readonly clientsService = inject(ClientsService);
  private readonly usersService = inject(UsersService);
  readonly auth = inject(AuthService);

  readonly stages = DEAL_STAGES;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deals = signal<Deal[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly users = signal<User[]>([]);
  readonly selected = signal<Deal | null>(null);
  readonly grouped = computed(() => {
    const groups = emptyGroups();
    for (const deal of this.deals()) {
      groups[deal.stage].push(deal);
    }
    return groups;
  });
  readonly form = this.fb.nonNullable.group({
    title: ["", Validators.required],
    value: [0, [Validators.required, Validators.min(0)]],
    clientId: ["", Validators.required],
    stage: ["LEAD" as DealStage, Validators.required],
    expectedCloseDate: [new Date().toISOString().slice(0, 10), Validators.required],
    assignedToId: [""]
  });

  ngOnInit(): void {
    this.load();
    this.clientsService.list({ limit: 100 }).subscribe({ next: (result) => this.clients.set(result.items) });
    if (this.auth.isAdmin()) {
      this.usersService.list().subscribe({ next: (users) => this.users.set(users.filter((user) => user.isActive !== false)) });
    }
  }

  load(): void {
    this.loading.set(true);
    this.dealsService
      .list({ limit: 100 })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({ next: (result) => this.deals.set(result.items) });
  }

  createDeal(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.dealsService
      .create({
        title: raw.title,
        value: Number(raw.value),
        clientId: raw.clientId,
        stage: raw.stage,
        expectedCloseDate: new Date(raw.expectedCloseDate).toISOString(),
        assignedToId: raw.assignedToId || undefined
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (deal) => {
          this.deals.update((deals) => [deal, ...deals]);
          this.form.patchValue({ title: "", value: 0, clientId: "", stage: "LEAD", assignedToId: "" });
        }
      });
  }

  drop(event: CdkDragDrop<Deal[]>, stage: DealStage): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const deal = event.previousContainer.data[event.previousIndex];
    if (!confirm(`Move "${deal.title}" to ${stage}?`)) {
      return;
    }

    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    this.dealsService.moveStage(deal.id, stage).subscribe({
      next: (updated) => this.replaceDeal(updated),
      error: () => this.load()
    });
  }

  moveFromModal(deal: Deal, event: Event): void {
    const stage = (event.target as HTMLSelectElement).value as DealStage;
    if (stage === deal.stage || !confirm(`Move "${deal.title}" to ${stage}?`)) {
      return;
    }
    this.dealsService.moveStage(deal.id, stage).subscribe({
      next: (updated) => {
        this.replaceDeal(updated);
        this.selected.set(updated);
      }
    });
  }

  private replaceDeal(updated: Deal): void {
    this.deals.update((deals) => deals.map((deal) => (deal.id === updated.id ? updated : deal)));
  }
}
