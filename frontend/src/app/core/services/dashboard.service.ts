import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ActivityItem, DashboardSummary, PipelineBucket } from "../models";
import { ApiService } from "./api.service";

@Injectable({ providedIn: "root" })
export class DashboardService {
  private readonly api = inject(ApiService);

  summary(): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>("/dashboard/summary");
  }

  pipeline(): Observable<PipelineBucket[]> {
    return this.api.get<PipelineBucket[]>("/dashboard/pipeline");
  }

  activity(): Observable<ActivityItem[]> {
    return this.api.get<ActivityItem[]>("/dashboard/activity");
  }
}
