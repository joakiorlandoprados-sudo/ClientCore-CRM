import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { Deal, DealStage, PageResult, PipelineBucket } from "../models";

export interface DealRequest {
  title: string;
  value: number;
  stage?: DealStage;
  clientId: string;
  assignedToId?: string;
  expectedCloseDate: string;
}

export interface DealQuery {
  page?: number;
  limit?: number;
  stage?: DealStage;
  assignedTo?: string;
  clientId?: string;
}

@Injectable({ providedIn: "root" })
export class DealsService {
  private readonly api = inject(ApiService);

  list(query: DealQuery = {}): Observable<PageResult<Deal>> {
    return this.api.get<PageResult<Deal>>("/deals", query);
  }

  create(body: DealRequest): Observable<Deal> {
    return this.api.post<Deal, DealRequest>("/deals", body);
  }

  update(id: string, body: Partial<DealRequest>): Observable<Deal> {
    return this.api.patch<Deal, Partial<DealRequest>>(`/deals/${id}`, body);
  }

  moveStage(id: string, stage: DealStage): Observable<Deal> {
    return this.api.patch<Deal, { stage: DealStage }>(`/deals/${id}/stage`, { stage });
  }

  aggregate(): Observable<PipelineBucket[]> {
    return this.api.get<PipelineBucket[]>("/deals/aggregate/stages");
  }
}
