// Sentry Configuration
import { init } from "@sentry/nextjs";
init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 0.1,
});
export default {};