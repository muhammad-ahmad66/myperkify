import axios from 'axios';
import { API_BASE_URL } from './config';
import { toApiError } from './errors';

/** The only axios instance. Components never call axios directly. */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
