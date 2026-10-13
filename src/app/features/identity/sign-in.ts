import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { toProblemDetails, type ProblemDetails } from '../../core/http/http-errors';
import { ProblemErrors } from '../../shared/ui/problem-errors';

/** Sign-in with e-mail and passphrase. Five failures lock the account for 15 minutes (backend). */
@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, ProblemErrors],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="mx-auto max-w-md px-4 py-12">
            <h1 class="text-2xl font-bold">Sign in</h1>
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
                    <span class="font-medium">Password</span>
                    <input
                        formControlName="password"
                        type="password"
                        autocomplete="current-password"
                        class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                    />
                </label>
                <app-problem-errors [problem]="problem()" />
                <button
                    type="submit"
                    [disabled]="form.invalid || isSubmitting()"
                    class="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                    {{ isSubmitting() ? 'Signing in…' : 'Sign in' }}
                </button>
            </form>
            <p class="mt-4 text-sm text-slate-600">
                No account yet? <a routerLink="/register" class="underline">Register</a>
            </p>
        </section>
    `,
})
export class SignIn {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    readonly form = new FormGroup({
        email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
        password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    });
    readonly isSubmitting = signal(false);
    readonly problem = signal<ProblemDetails | null>(null);

    submit(): void {
        if (this.form.invalid || this.isSubmitting()) {
            return;
        }
        this.isSubmitting.set(true);
        this.problem.set(null);
        const { email, password } = this.form.getRawValue();
        this.auth.signIn(email, password).subscribe({
            next: () => {
                const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/products';
                void this.router.navigateByUrl(returnUrl);
            },
            error: (error: unknown) => {
                this.problem.set(toProblemDetails(error));
                this.isSubmitting.set(false);
            },
            complete: () => this.isSubmitting.set(false),
        });
    }
}
