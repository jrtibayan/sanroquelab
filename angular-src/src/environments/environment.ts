// environment.ts
export const environment = {
    production: false,
    apiUrl: window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'http://192.168.10.35:3000',
};