import { describe, expect, it } from 'vitest';
import { isProblemDetails } from './api.models';

describe('isProblemDetails', () => {
  it('should accept a backend-shaped failure', () => {
    expect(
      isProblemDetails({
        type: 'https://errors.example.com/business-rule-violation',
        title: 'The order violates a business rule.',
        status: 422,
        detail: 'The order total must be at least 10.00 BRL.',
        instance: '/api/v1/orders/1',
        traceId: 'abc',
        errors: [],
      })
    ).toBe(true);
  });

  it('should reject null, primitives, and partial payloads', () => {
    expect(isProblemDetails(null)).toBe(false);
    expect(isProblemDetails('oops')).toBe(false);
    expect(isProblemDetails({ title: 'x', status: 500 })).toBe(false);
    expect(isProblemDetails({ type: 't', title: 'x', status: 500, errors: {} })).toBe(false);
  });
});
