import * as Sentry from '@sentry/browser';

export default defineNuxtPlugin(() => {
  Sentry.init({
    dsn: 'https://db7b76f4c7994408ae42fffd928bbe55@o4504867917529088.ingest.sentry.io/4504884952956928',
    environment: process.env.AR_AM_ENVIRONMENT || 'development',
    tracesSampleRate: 1.0
  });
});