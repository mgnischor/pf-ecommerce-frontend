/**
 * Access levels enforced by the backend, lowest first.
 * Every route names the minimum level it needs; anonymous routes are explicit
 * (backend default-deny, ai/SECURITY.md section 2.2).
 */
export type AccessLevel = 'public' | 'collaborator' | 'manager' | 'administrator' | 'developer';

const RANK: Record<AccessLevel, number> = {
    public: 0,
    collaborator: 1,
    manager: 2,
    administrator: 3,
    developer: 4,
};

/** True when `actual` satisfies the `minimum` level required by a route. */
export function satisfiesAccessLevel(actual: AccessLevel | null, minimum: AccessLevel): boolean {
    if (actual === null) {
        return minimum === 'public';
    }
    return RANK[actual] >= RANK[minimum];
}
