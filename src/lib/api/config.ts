export const MOCK_API_PATH = '/api/mock';

/** The real API once D-16 is decided. Until then the whole app runs on mock data. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || MOCK_API_PATH;
export const USES_MOCK_API = API_BASE_URL === MOCK_API_PATH;

/** The Dev panel plays the cashier and admin. Never on a public build by default. */
export const DEV_TOOLS_ENABLED =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEV_TOOLS === 'true';
