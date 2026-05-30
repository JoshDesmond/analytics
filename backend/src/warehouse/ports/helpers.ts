import type { Request, Response } from 'express';

export function resolverErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof err.message === 'string'
  ) {
    return err.message;
  }
  return String(err);
}

export function sendResolverError(
  res: Response,
  err: unknown,
  label: string,
): void {
  console.error(err);
  const message = resolverErrorMessage(err);
  const status =
    message.includes('date must be') || message.includes('limit must')
      ? 400
      : 500;
  res.status(status).json({ error: `${label}: ${message}` });
}

export function getQueryParam(req: Request, name: string): unknown {
  return req.query[name];
}
