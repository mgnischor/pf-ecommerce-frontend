import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { firstErrorCode, toProblemDetails } from './http-errors';

describe('toProblemDetails', () => {
  it('should pass backend failures through unchanged', () => {
    const backend = {
      type: 'https://errors.example.com/business-rule-violation',
      title: 'The order violates a business rule.',
      status: 422,
      detail: 'Too small.',
      instance: '/api/v1/orders/1',
      traceId: 'trace',
      errors: [
        {
          ruleId: 'BR-ORD-001',
          field: '/total',
          code: 'ORDER_TOTAL_BELOW_MINIMUM',
          message: 'Too small.',
          params: null,
        },
      ],
    };
    const result = toProblemDetails(new HttpErrorResponse({ status: 422, error: backend }));
    expect(result).toEqual(backend);
    expect(firstErrorCode(result)).toBe('ORDER_TOTAL_BELOW_MINIMUM');
  });

  it('should normalize network failures to the same shape without internals', () => {
    const result = toProblemDetails(new HttpErrorResponse({ status: 0 }));
    expect(result.errors).toEqual([]);
    expect(result.title).toContain('could not be completed');
    expect(firstErrorCode(result)).toBeNull();
  });
});
