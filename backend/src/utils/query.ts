export function getQueryString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

export function getPagination(query: Record<string, unknown>): { skip: number; take: number; page: number; limit: number } {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit
  };
}
