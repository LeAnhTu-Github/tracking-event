import { z } from 'zod';

export const AppConfigFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  appId: z.string().min(1, 'AppMetrica App ID is required'),
  apiToken: z.string().min(1, 'OAuth token is required'),
  scheduleTime: z.string().min(1, 'Schedule time is required'),
  intervalMinutes: z.number().int().min(1, 'Interval must be at least 1 minute'),
  isActive: z.boolean()
});

export const AnalyticsConfigSchema = z.object({
  events: z.object({
    level_start: z.string().default(''),
    level_win: z.string().default(''),
    level_fail: z.string().default('')
  }),
  boosters: z.array(
    z.object({
      event_name: z.string().min(1, 'Event name is required'),
      display_name: z.string().optional().default(''),
      coin_cost: z.coerce.number().int().min(0, 'Coin cost must be >= 0')
    })
  )
});

