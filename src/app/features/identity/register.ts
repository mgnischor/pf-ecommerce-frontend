import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { toProblemDetails, type ProblemDetails } from '../../core/http/http-errors';
import { ProblemErrors } from '../../shared/ui/problem-errors';

/** Customer self-registration. Accounts start at the public level (backend). */
@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, ProblemErrors],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="mx-auto max-w-md px-4 py-12">
            <h1 class="text-2xl font-bold">Create an account</h1>
            <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4">
                <label class="block text-sm">
                    <span class="font-medium">E-mail</span>
                    <input
                        formControlName="email"
                        type="email"
                        autocomplete="email"
                        class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                    />
                </label>
                <label class="block text-sm">
                    <span class="font-medium">Password (use a long unique passphrase)</span>
                    <input
                        formControlName="password"
                        type="password"
                        autocomplete="new-password"
                        minlength="12"
                        class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                    />
                </label>
                <label class="block text-sm">
                    <span class="font-medium">Full name (optional)</span>
                    <input
                        formControlName="fullName"
                        type="text"
                        autocomplete="name"
                        class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                    />
                </label>
                <app-problem-errors [problem]="problem()" />
                <button
                    type="submit"
                    [disabled]="form.invalid || isSubmitting()"
                    class="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                    {{ isSubmitting() ? 'Creating account…' : 'Register' }}
                </button>
            </form>
            <p class="mt-4 text-sm text-slate-600">
                Already have an account? <a routerLink="/sign-in" class="underline">Sign in</a>
            </p>
        </section>
    `,
})
export class Register {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);

    readonly form = new FormGroup({
        email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
        password: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(12)],
        }),
        fullName: new FormControl('', { nonNullable: true }),
    });
    readonly isSubmitting = signal(false);
    readonly problem = signal<ProblemDetails | null>(null);

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            return;
        }
        this.isSubmitting.set(true);
        this.problem.set(null);
        const raw = this.form.getRawValue();
        this.auth
            .register({
                email: raw.email,
                password: raw.password,
                fullName: raw.fullName || undefined,
            })
            .subscribe({
                next: () => {
                    void this.router.navigate(['/sign-in']);
                },
                error: (error: unknown) => {
                    this.problem.set(toProblemDetails(error));
                    this.isSubmitting.set(false);
                },
                complete: () => this.isSubmitting.set(false),
            });
    }
}
