import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { API_URL, HTTP_DEFAULTS } from '@/lib/constants';

export class ApiConfigError extends Error {
  public override readonly name: string = 'ApiConfigError';
  public constructor(message: string) {
    super(message);
  }
}

export class ApiRequestError extends Error {
  public override readonly name: string = 'ApiRequestError';
  public readonly statusCode: number | null;
  public readonly causeError: AxiosError | null;
  public constructor(params: {
    message: string;
    statusCode: number | null;
    causeError: AxiosError | null;
  }) {
    super(params.message);
    this.statusCode = params.statusCode;
    this.causeError = params.causeError;
  }
}

const createApiClient = (): AxiosInstance => {
  if (!API_URL) {
    throw new ApiConfigError(
      'Missing NEXT_PUBLIC_API_URL. Define it in .env.local (client) or environment variables.'
    );
  }
  const client: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: HTTP_DEFAULTS.TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  });
  return client;
};

export const apiClient: AxiosInstance = createApiClient();

const getAxiosError = (err: unknown): AxiosError | null => {
  return err instanceof AxiosError ? err : null;
};

const throwApiRequestError = (err: unknown, message: string): never => {
  const axiosError: AxiosError | null = getAxiosError(err);
  throw new ApiRequestError({
    message,
    statusCode: axiosError?.response?.status ?? null,
    causeError: axiosError
  });
};

/**
 * Executes a typed GET request.
 */
export const getRequest = async <TResponse>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<TResponse> => {
  try {
    const response = await apiClient.get<TResponse>(url, config);
    return response.data;
  } catch (err: unknown) {
    return throwApiRequestError(err, 'GET request failed');
  }
};

/**
 * Executes a typed POST request.
 */
export const postRequest = async <TResponse, TBody = unknown>(
  url: string,
  body: TBody,
  config: AxiosRequestConfig = {}
): Promise<TResponse> => {
  try {
    const response = await apiClient.post<TResponse>(url, body, config);
    return response.data;
  } catch (err: unknown) {
    return throwApiRequestError(err, 'POST request failed');
  }
};

/**
 * Executes a typed PUT request.
 */
export const putRequest = async <TResponse, TBody = unknown>(
  url: string,
  body: TBody,
  config: AxiosRequestConfig = {}
): Promise<TResponse> => {
  try {
    const response = await apiClient.put<TResponse>(url, body, config);
    return response.data;
  } catch (err: unknown) {
    return throwApiRequestError(err, 'PUT request failed');
  }
};

/**
 * Executes a typed DELETE request.
 */
export const deleteRequest = async <TResponse>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<TResponse> => {
  try {
    const response = await apiClient.delete<TResponse>(url, config);
    return response.data;
  } catch (err: unknown) {
    return throwApiRequestError(err, 'DELETE request failed');
  }
};
