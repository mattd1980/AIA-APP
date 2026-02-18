import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from './async-handler';

function createMocks() {
  const req = {} as Request;
  const res = {} as Response;
  const next: NextFunction = vi.fn();
  return { req, res, next };
}

describe('asyncHandler', () => {
  it('calls the wrapped function and resolves without calling next on success', async () => {
    const { req, res, next } = createMocks();
    const fn = vi.fn().mockResolvedValue(undefined);

    const handler = asyncHandler(fn);
    await handler(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards rejected promise errors to next', async () => {
    const { req, res, next } = createMocks();
    const error = new Error('async failure');
    const fn = vi.fn().mockRejectedValue(error);

    const handler = asyncHandler(fn);
    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
