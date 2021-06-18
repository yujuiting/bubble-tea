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
