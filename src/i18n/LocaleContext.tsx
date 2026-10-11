import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getProcessContent } from '../data/localizedProcesses';
import { ui } from './ui';
import type { Locale, Theme } from './types';

const PREFERENCE_KEY = 'fab15-display-v1';

function readPreferences(): { locale: Locale; theme: Theme } {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFERENCE_KEY) ?? '{}');
    return {
      locale: ['ja', 'en', 'zh'].includes(saved?.locale) ? saved.locale : 'ja',
      theme: ['day', 'night'].includes(saved?.theme) ? saved.theme : 'day',
    };
  } catch { return { locale: 'ja', theme: 'day' }; }
}

function useDisplayPreferences() {
  const [preferences, setPreferences] = useState(readPreferences);
  const { locale, theme } = preferences;
  const content = useMemo(() => getProcessContent(locale), [locale]);
  const text = ui[locale];
  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale;
    document.documentElement.dataset.theme = theme;
    document.title = content.modelTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', content.scopeNote);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'night' ? '#111e2b' : '#ffffff');
    try { localStorage.setItem(PREFERENCE_KEY, JSON.stringify({ locale, theme })); } catch { /* Preferences still work when storage is unavailable. */ }
  }, [locale, theme, content.modelTitle, content.scopeNote]);
  return {
    ...content, text, locale, theme,
    setLocale: (next: Locale) => setPreferences(current => ({ ...current, locale: next })),
    setTheme: (next: Theme) => setPreferences(current => ({ ...current, theme: next })),
  };
}

const LocaleContext = createContext<ReturnType<typeof useDisplayPreferences> | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const value = useDisplayPreferences();
  return <LocaleContext value={value}>{children}</LocaleContext>;
}

export function useI18n() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('LocaleProvider is missing.');
  return context;
}
