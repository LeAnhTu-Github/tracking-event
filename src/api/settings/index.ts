import { getRequest, postRequest } from '@/lib/api';

import type { Booster, CreateBoosterBody } from './types';

export const listBoosters = async (): Promise<readonly Booster[]> => {
  return await getRequest<readonly Booster[]>('/api/settings/boosters');
};

export const createBooster = async (
  body: CreateBoosterBody
): Promise<Booster> => {
  return await postRequest<Booster, CreateBoosterBody>('/api/settings/boosters', body);
};

