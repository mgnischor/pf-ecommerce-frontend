/** Development environment. Same-origin /api/v1 goes through proxy.conf.json (no CORS). */
export const environment = {
    production: false,
    apiBaseUrl: '/api/v1',
    defaultLocale: 'en',
};
