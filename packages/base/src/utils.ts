import { isTokenAmount } from './predictors';
import { findTokenVariant } from './token';

export function toArray<T>(value: T | T[]) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

export function fromArray<T>(value: T | T[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function makeQueryParams<Params extends Record<string, unknown>>(params: Params): string {
  const pairs: string[] = [];
  for (const key in params) {
    if (params[key] !== undefined) pairs.push(`${key}=${params[key]}`);
  }
  return pairs.join('&');
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function zip<T, U>(a: T[], b: U[]): [T, U][] {
  const length = Math.min(a.length, b.length);
  const result: [T, U][] = [];
  for (let i = 0; i < length; i++) result.push([a[i], b[i]]);
  return result;
}

export function noop(..._: any[]): any {}

export function toNumber(value: unknown) {
  if (typeof value === 'number') return value;
  if (isTokenAmount(value)) {
    const { token, chain, amount } = value;
    const { decimals = 0 } = findTokenVariant(token, chain) || {};
    return parseInt(amount, 10) / 10 ** decimals;
  }
  return Number.NaN;
}
