import { z } from 'zod';

export const SystemConfigSchema = z.object({
  intervalMinutes: z.coerce
    .number()
    .int('Interval must be an integer')
    .min(1, 'Interval must be at least 1 minute')
});

