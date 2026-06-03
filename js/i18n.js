// js/i18n.js

// shared language state
export const langState = { current: 'en' };
export function setLang(lang) { langState.current = lang; }

// Resolve a {en,pl} value (or plain string) to a display string.
// `lang` defaults to the shared current language, so `setLang(...)` + `t(value)`
// works; callers may still pass `lang` explicitly. Empty/missing pl falls back to en.
export function t(value, lang = langState.current) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  const v = value[lang];
  if (v != null && v !== '') return v;
  return value.en ?? '';
}
