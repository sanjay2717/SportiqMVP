export const config = {
  appName: import.meta.env.VITE_APP_NAME ?? 'SportIQ',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  appUrl: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
} as const;
