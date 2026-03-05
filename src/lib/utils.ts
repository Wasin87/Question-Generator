import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertToBengaliNumber = (num: number | string): string => {
  const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(digit => bengaliNumbers[parseInt(digit)] || digit).join('');
};

export const BENGALI_LABELS = {
  k: '(ক)',
  kh: '(খ)',
  g: '(গ)',
  gh: '(ঘ)'
};
