import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { API_BASE_URL, DEFAULT_LOCALE } from './core/api/api.tokens';
import { authInterceptor } from './core/http/auth.interceptor';
import { correlationInterceptor } from './core/http/correlation.interceptor';
import { languageInterceptor } from './core/http/language.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(
            withFetch(),
            withInterceptors([correlationInterceptor, languageInterceptor, authInterceptor])
        ),
        { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
        { provide: DEFAULT_LOCALE, useValue: environment.defaultLocale },
    ],
};
