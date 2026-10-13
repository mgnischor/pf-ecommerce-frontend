import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { MoneyPipe } from './money.pipe';

function setup(locale = 'en-US'): MoneyPipe {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: locale }] });
    return TestBed.runInInjectionContext(() => new MoneyPipe());
}

describe('MoneyPipe', () => {
    it('should format the decimal-string amount with its currency', () => {
        const pipe = setup('en-US');
        expect(pipe.transform({ amount: '189.90', currency: 'BRL' })).toContain('189.90');
    });

    it('should return an empty string for missing or non-numeric amounts', () => {
        const pipe = setup();
        expect(pipe.transform(null)).toBe('');
        expect(pipe.transform(undefined)).toBe('');
        expect(pipe.transform({ amount: 'not-a-number', currency: 'BRL' })).toBe('');
    });
});
