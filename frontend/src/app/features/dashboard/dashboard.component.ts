import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { forkJoin, finalize } from "rxjs";
import { ActivityItem, DashboardSummary, PipelineBucket } from "../../core/models";
import { DashboardService } from "../../core/services/dashboard.service";
import { StatusPanelComponent } from "../../shared/status-panel.component";

@Component({
  selector: "cc-dashboard",
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, StatusPanelComponent],
  styles: [
    `
      .pipeline-bars {
        display: grid;
        gap: 12px;
      }

      .bar-row {
        display: grid;
        grid-template-columns: 130px 1fr 90px;
        align-items: center;
        gap: 12px;
      }

      .bar-track {
        height: 12px;
        border-radius: 999px;
        background: var(--panel-alt);
        overflow: hidden;
      }

      .bar-fill {
        height: 100%;
        border-radius: inherit;
        background: var(--accent);
      }

      .activity-list {
        display: grid;
        gap: 10px;
      }

      .activity-item {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 10px;
        border: 1px solid var(--line);
        border-radius: 8px;
      }
    `
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Current account health and sales activity.</p>
      </div>
    </div>

    @if (loading()) {
      <cc-status-panel title="Loading dashboard" message="Fetching CRM metrics." />
    } @else {
      <section class="grid kpi-grid">
        <article class="metric-card">
          <span>Total clients</span>
          <strong>{{ summary()?.totalClients ?? 0 }}</strong>
        </article>
        <article class="metric-card">
          <span>Open deals</span>
          <strong>{{ summary()?.openDeals ?? 0 }}</strong>
        </article>
        <article class="metric-card">
          <span>Tasks due today</span>
          <strong>{{ summary()?.tasksDueToday ?? 0 }}</strong>
        </article>
        <article class="metric-card">
          <span>Won this month</span>
          <strong>{{ (summary()?.revenueWonThisMonth ?? 0) | currency }}</strong>
        </article>
      </section>

      <section class="split" style="margin-top: 18px;">
        <article class="panel">
          <h2>Pipeline</h2>
          @if (pipeline().length === 0) {
            <cc-status-panel title="No pipeline data" message="Deals will appear here after creation." compact />
          } @else {
            <div class="pipeline-bars" style="margin-top: 16px;">
              @for (bucket of pipeline(); track bucket.stage) {
                <div class="bar-row">
                  <strong>{{ bucket.stage }}</strong>
                  <div class="bar-track" aria-hidden="true">
                    <div class="bar-fill" [style.width.%]="barWidth(bucket)"></div>
                  </div>
                  <span>{{ bucket.totalValue | currency }}</span>
                </div>
              }
            </div>
          }
        </article>

        <article class="panel">
          <h2>Recent activity</h2>
          @if (activity().length === 0) {
            <cc-status-panel title="No recent activity" message="Notes and tasks will appear here." compact />
          } @else {
            <div class="activity-list" style="margin-top: 16px;">
              @for (item of activity(); track item.type + item.id) {
                <div class="activity-item">
                  <span class="badge">{{ item.type }}</span>
                  <div>
                    <strong>{{ item.title }}</strong>
                    <div style="color: var(--muted); font-size: .86rem;">{{ item.actor }} · {{ item.client || item.deal }}</div>
                  </div>
                  <time>{{ item.createdAt | date: "MMM d" }}</time>
                </div>
              }
            </div>
          }
        </article>
      </section>
    }
  `
})
export class DashboardComponent implements OnInit {
  private readonly dashboard = inject(DashboardService);
  readonly loading = signal(true);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly pipeline = signal<PipelineBucket[]>([]);
  readonly activity = signal<ActivityItem[]>([]);

  ngOnInit(): void {
    forkJoin({
      summary: this.dashboard.summary(),
      pipeline: this.dashboard.pipeline(),
      activity: this.dashboard.activity()
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ summary, pipeline, activity }) => {
          this.summary.set(summary);
          this.pipeline.set(pipeline);
          this.activity.set(activity);
        }
      });
  }

  barWidth(bucket: PipelineBucket): number {
    const max = Math.max(...this.pipeline().map((item) => item.totalValue), 1);
    return Math.max((bucket.totalValue / max) * 100, bucket.count > 0 ? 6 : 0);
  }
}
