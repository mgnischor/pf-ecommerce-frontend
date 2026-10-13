import { inject, LOCALE_ID, Pipe, type PipeTransform } from '@angular/core';
import type { Money } from '../../core/api/api.models';

/**
 * Formats backend money ({ amount: decimal string, currency }) with
 * locale-aware Intl.NumberFormat. The decimal string is parsed only for
 * display; the authoritative value stays a string on the wire
 * (backend ai/API_CONTRACTS.md section 3).
 */
@Pipe({ name: 'appMoney', standalone: true })
export class MoneyPipe implements PipeTransform {
    private readonly locale = inject(LOCALE_ID);

    transform(value: Money | null | undefined): string {
        if (value === null || value === undefined) {
            return '';
        }
        const amount = Number(value.amount);
        if (!Number.isFinite(amount)) {
            return '';
        }
        return new Intl.NumberFormat(this.locale, {
            style: 'currency',
            currency: value.currency,
        }).format(amount);
    }
}
