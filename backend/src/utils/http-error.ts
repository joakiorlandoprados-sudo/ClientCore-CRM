export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string, details?: unknown): HttpError =>
  new HttpError(400, message, details);

export const unauthorized = (message = "Unauthorized"): HttpError =>
  new HttpError(401, message);

export const forbidden = (message = "Forbidden"): HttpError =>
  new HttpError(403, message);

export const notFound = (message = "Resource not found"): HttpError =>
  new HttpError(404, message);
