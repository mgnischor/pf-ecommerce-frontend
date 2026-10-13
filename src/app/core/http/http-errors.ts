import { HttpErrorResponse } from '@angular/common/http';
import { isProblemDetails } from '../api/api.models';
import type { ProblemDetails } from '../api/api.models';

export type { ProblemDetails };

/**
 * Normalizes any HTTP failure to Problem Details. Unknown failures become a
 * local fallback with the same shape so views branch on one type. Never
 * includes stack traces or response internals beyond what the backend sent.
 */
export function toProblemDetails(error: unknown): ProblemDetails {
    if (error instanceof HttpErrorResponse && isProblemDetails(error.error)) {
        return error.error;
    }
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    return {
        type: 'https://errors.local/network-failure',
        title: 'The request could not be completed.',
        status,
        detail: 'Check the connection and try again.',
        instance: '',
        traceId: '',
        errors: [],
    };
}

/** First machine-readable code, or null when the failure carries none. */
export function firstErrorCode(problem: ProblemDetails): string | null {
    return problem.errors.length > 0 ? (problem.errors[0]?.code ?? null) : null;
}
