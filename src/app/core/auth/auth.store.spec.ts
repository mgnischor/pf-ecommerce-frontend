import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AuthStore } from './auth.store';

function setup(): AuthStore {
    TestBed.configureTestingModule({});
    return TestBed.inject(AuthStore);
}

describe('AuthStore', () => {
    it('should start signed out', () => {
        const store = setup();
        expect(store.isAuthenticated()).toBe(false);
        expect(store.accessToken()).toBeNull();
    });

    it('should hold tokens in memory after sign-in and clear on sign-out', () => {
        const store = setup();
        store.setSession({
            accessToken: 'access',
            refreshToken: 'refresh',
            accessLevel: 'manager',
            email: 'ana.souza@example.com',
        });
        expect(store.isAuthenticated()).toBe(true);
        expect(store.accessLevel()).toBe('manager');

        store.updateAccessToken('access-2', 'refresh-2');
        expect(store.accessToken()).toBe('access-2');

        store.clear();
        expect(store.isAuthenticated()).toBe(false);
    });

    it('should ignore token rotation while signed out', () => {
        const store = setup();
        store.updateAccessToken('access', 'refresh');
        expect(store.isAuthenticated()).toBe(false);
    });
});
