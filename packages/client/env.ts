export const DEV = env('NODE_ENV') !== 'production';

export const BSC_ENDPOINT = env('BSC_ENDPOINT');

export const SOL_ENDPOINT = env('SOL_ENDPOINT');

export const INFURA_PROJECT_ID = env('INFURA_PROJECT_ID');

export const INFURA_PROJECT_SECRET = env('INFURA_PROJECT_SECRET');

export const BSCSCAN_API_KEY = env('BSCSCAN_API_KEY');

export const ETHERSCAN_API_KEY = env('ETHERSCAN_API_KEY');

function env(key: string, fallback = '') {
  return process.env[key] || fallback;
}
