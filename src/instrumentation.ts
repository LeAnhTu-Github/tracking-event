/**
 * Next.js Instrumentation Hook
 *
 * This project does not require runtime instrumentation/tracing at the moment.
 * Keeping this file prevents Next.js (Turbopack) from attempting to load
 * optional instrumentation integrations which can fail when their transitive
 * dependencies aren't present.
 */
export const register = async (): Promise<void> => {
  return;
};

