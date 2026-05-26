import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, switchMap, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken();
  const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      const httpError = error instanceof HttpErrorResponse ? error : null;
      const isAuthRequest = req.url.includes("/auth/login") || req.url.includes("/auth/refresh");

      if (httpError?.status === 401 && !isAuthRequest && auth.refreshToken()) {
        return auth.refresh().pipe(
          switchMap((payload) =>
            next(req.clone({ setHeaders: { Authorization: `Bearer ${payload.accessToken}` } }))
          ),
          catchError((refreshError: unknown) => {
            auth.clearSession();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
