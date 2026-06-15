export function formatClientDateTime(isoDate: string, locale = 'vi-VN') {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(new Date(isoDate));
}

export function formatPercent(value: number) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}

export function formatCompactNumber(value: number) {
  return value.toLocaleString('vi-VN');
}

export function formatUsd(value: number) {
  return `${value.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
}
