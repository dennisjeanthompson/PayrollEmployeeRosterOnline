import { format as dateFnsFormat, isValid } from 'date-fns';

export function safeFormat(date: Date | number | string | null | undefined, formatStr: string, fallback = ''): string {
  if (!date) return fallback;
  const d = new Date(date);
  if (!isValid(d)) return fallback;
  try {
    return dateFnsFormat(d, formatStr);
  } catch (e) {
    return fallback;
  }
}
