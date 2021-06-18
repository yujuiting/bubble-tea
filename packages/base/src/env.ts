export function env(key: string, fallback = '') {
  return process.env[key] || fallback;
}
