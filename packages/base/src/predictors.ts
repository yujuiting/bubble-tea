import { Chain } from './chain';
import { Token, TokenVariant } from './token';
import { TokenAmount, PoolAmount } from './token-amount';

export function isTruthy<T>(value: T): value is Exclude<T, undefined | null | '' | 0> {
  return !!value;
}

export function isObject(value: unknown): value is object {
  return must(
    () => typeof value === 'object',
    () => value !== null,
  );
}

export function isChain(value: unknown): value is Chain {
  return must(
    () => isObject(value),
    () => typeOf(get<Chain>(value, 'name'), 'string'),
    () => typeOf(get<Chain>(value, 'id'), 'string'),
    () => typeOf(get<Chain>(value, 'nativeToken'), 'string'),
  );
}

export function isToken(value: unknown): value is Token {
  return must(
    () => isObject(value),
    () => typeOf(get<Token>(value, 'name'), 'string'),
    () => typeOf(get<Token>(value, 'symbol'), 'string'),
    () => typeOf(get<Token>(value, 'icon'), 'string', 'undefined'),
    () => typeOf(get<Token>(value, 'coinGeckoId'), 'string', 'undefined'),
    () => Array.isArray(get<Token>(value, 'variants')),
    () => get<Token>(value, 'variants').every(isTokenVariant),
  );
}

export function isTokenVariant(value: unknown): value is TokenVariant {
  return must(
    () => isObject(value),
    () => typeOf(get<TokenVariant>(value, 'decimals'), 'number'),
    () => typeOf(get<TokenVariant>(value, 'address'), 'string'),
    () => isChain(get<TokenVariant>(value, 'chain')),
  );
}

export function isTokenAmount(value: unknown): value is TokenAmount {
  return must(
    () => isObject(value),
    () => isChain(get<TokenAmount>(value, 'chain')),
    () => isToken(get<TokenAmount>(value, 'token')),
    () => typeOf(get<TokenAmount>(value, 'amount'), 'string'),
  );
}

export function isPoolAmount(value: unknown): value is PoolAmount {
  return must(
    () => isTokenAmount(value),
    () => Array.isArray(get<PoolAmount>(value, 'contains')),
    () => get<PoolAmount>(value, 'contains').every(isTokenAmount),
  );
}

function get<T>(obj: any, key: keyof T) {
  return obj[key];
}

type PrimitiveType = 'string' | 'number' | 'undefined' | 'object';

function typeOf(value: unknown, ...types: [PrimitiveType, ...PrimitiveType[]]) {
  for (const type of types) {
    if (typeof value === type) return true;
  }
  return false;
}

export function must(...conditions: (() => boolean)[]) {
  return conditions.every(condition => isTruthy(condition()));
}
