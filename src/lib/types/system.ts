import type { z } from 'zod';

import { SystemConfigSchema } from '@/lib/schemas/system';

export type SystemConfigFormValues = z.infer<typeof SystemConfigSchema>;

