import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models";

type QueryValue = string | number | boolean | null | undefined;

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl =
    environment.apiUrl ||
    `${window.location.protocol}//${window.location.hostname}:3000/api`;

  get<T>(path: string, params?: object): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}${path}`, { params: this.toHttpParams(params) })
      .pipe(map((response) => response.data));
  }

  post<T, B extends object>(path: string, body: B): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body).pipe(map((response) => response.data));
  }

  patch<T, B extends object>(path: string, body: B): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${path}`, body).pipe(map((response) => response.data));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${path}`).pipe(map((response) => response.data));
  }

  private toHttpParams(params?: object): HttpParams {
    let httpParams = new HttpParams();
    if (!params) {
      return httpParams;
    }

    Object.entries(params).forEach(([key, value]) => {
      const typedValue = value as QueryValue;
      if (typedValue !== undefined && typedValue !== null && typedValue !== "") {
        httpParams = httpParams.set(key, String(typedValue));
      }
    });
    return httpParams;
  }
}
