const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts Latin or Arabic digits to Persian digits
 */
export function toPersianDigits(input: number | string | undefined | null): string {
  if (input === undefined || input === null) return '';
  return String(input).replace(/[0-9]/g, (char) => PERSIAN_DIGITS[parseInt(char, 10)]);
}

/**
 * Converts Persian/Arabic digits to Latin digits
 */
export function toLatinDigits(input: string): string {
  if (!input) return '';
  let res = input;
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), String(i));
    res = res.replace(new RegExp(ARABIC_DIGITS[i], 'g'), String(i));
  }
  return res;
}

/**
 * Formats a number with thousands separators and Persian digits
 */
export function formatNumberPersian(num: number): string {
  if (typeof num !== 'number' || isNaN(num)) return '۰';
  const parts = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '،');
  return toPersianDigits(parts);
}

/**
 * Formats price in Tomans with Persian numerals
 */
export function formatToman(amount: number): string {
  return `${formatNumberPersian(amount)} تومان`;
}

/**
 * Formats gold weight in grams with up to 2 decimal places in Persian
 */
export function formatWeight(grams: number): string {
  if (typeof grams !== 'number' || isNaN(grams)) return '۰ گرم';
  const rounded = Number(grams.toFixed(2));
  const str = rounded.toString().replace('.', '٫');
  return `${toPersianDigits(str)} گرم`;
}

/**
 * Normalizes Persian search text for forgiving user searches
 * - Handles ی / ي / ى
 * - Handles ک / ك
 * - Handles digits (0-9 to Persian or vice versa)
 * - Removes extra spaces, diacritics, and ZWNJs
 */
export function normalizePersianText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F]/g, '') // Arabic diacritics / Harakat
    .replace(/\u200C/g, ' ') // ZWNJ to space
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/\s+/g, ' ')
    .trim();
}
