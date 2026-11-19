import * as Sentry from '@sentry/react-native';
import { appConfig } from './config';

let initialized = false;

/**
 * Crash + performance monitoring. Never blocks or crashes app start; no-op without a DSN.
 * Privacy: no PII, and breadcrumbs that could contain user-entered text are dropped
 * (see specs/001-task-list/plan.md "External integrations").
 */
export function initMonitoring(): void {
  if (initialized || !appConfig.sentryDsn) return;
  try {
    Sentry.init({
      dsn: appConfig.sentryDsn,
      environment: appConfig.appVariant,
      sendDefaultPii: false,
      tracesSampleRate: appConfig.appVariant === 'production' ? 0.2 : 1.0,
      enableAutoSessionTracking: true,
      beforeBreadcrumb(breadcrumb) {
        // Console output and text-input events may contain task titles.
        if (breadcrumb.category === 'console' || breadcrumb.category === 'ui.input') return null;
        return breadcrumb;
      },
    });
    initialized = true;
  } catch {
    // Monitoring must never take the app down. Nothing else to report to.
    initialized = false;
  }
}

export function reportError(error: unknown, context?: string): void {
  if (__DEV__) {
    console.warn(`[${context ?? 'error'}]`, error);
  }
  if (initialized) {
    Sentry.captureException(error, context ? { tags: { context } } : undefined);
  }
}

export const wrapRoot = Sentry.wrap;
