import type { z } from 'zod';

import { AnalyticsConfigSchema, AppConfigFormSchema } from '@/lib/schemas/app';

export type AppConfigFormValues = z.infer<typeof AppConfigFormSchema>;
export type AnalyticsConfigValues = z.infer<typeof AnalyticsConfigSchema>;
export type AnalyticsConfigFormValues = z.input<typeof AnalyticsConfigSchema>;

