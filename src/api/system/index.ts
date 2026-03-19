import { getRequest, postRequest } from '@/lib/api';

import type {
  SaveSystemConfigBody,
  SaveSystemConfigResponse,
  SystemConfigResponse
} from './types';

export const getSystemConfig = async (): Promise<SystemConfigResponse> => {
  return await getRequest<SystemConfigResponse>('/api/system/config');
};

export const saveSystemConfig = async (
  body: SaveSystemConfigBody
): Promise<SaveSystemConfigResponse> => {
  return await postRequest<SaveSystemConfigResponse, SaveSystemConfigBody>(
    '/api/system/config',
    body
  );
};

