import { describe, expect, it } from 'vitest';
import { satisfiesAccessLevel } from './access-level';

describe('satisfiesAccessLevel', () => {
    it('should grant public routes to anonymous callers', () => {
        expect(satisfiesAccessLevel(null, 'public')).toBe(true);
    });

    it('should deny protected routes to anonymous callers', () => {
        expect(satisfiesAccessLevel(null, 'collaborator')).toBe(false);
    });

    it('should respect the hierarchy from public to developer', () => {
        expect(satisfiesAccessLevel('manager', 'collaborator')).toBe(true);
        expect(satisfiesAccessLevel('collaborator', 'manager')).toBe(false);
        expect(satisfiesAccessLevel('developer', 'administrator')).toBe(true);
        expect(satisfiesAccessLevel('administrator', 'developer')).toBe(false);
    });

    it('should grant a level its own minimum', () => {
        expect(satisfiesAccessLevel('manager', 'manager')).toBe(true);
    });
});
