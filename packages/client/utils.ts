import { cacheKey, TokenAmount } from '@bubble-tea/base';

export function copyText(value: unknown) {
  const elem = document.createElement('input');
  elem.value = `${value}`;
  document.body.appendChild(elem);
  elem.select();
  elem.setSelectionRange(0, 9999); // for mobile
  document.execCommand('copy');
  elem.remove();
}

export function displayNumber(value: number, options: Intl.NumberFormatOptions = {}) {
  return value.toLocaleString(getLocale(), { minimumFractionDigits: 4, maximumFractionDigits: 4, ...options });
}

export function getLocale() {
  if (process.browser) {
    return navigator.language;
  }
  return undefined;
}

export function filterVisibleTokenAmounts(tokenAmounts: TokenAmount[], hideTokens?: string[]) {
  if (!hideTokens) return tokenAmounts;
  return tokenAmounts.filter(tokenAmount => {
    const key = cacheKey(tokenAmount.token.symbol, tokenAmount.token.name);
    return !hideTokens.includes(key);
  });
}
