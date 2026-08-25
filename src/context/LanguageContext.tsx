import React from 'react';
import { useLanguageStore, Language } from '../stores/useLanguageStore';

export type { Language };

interface LanguageContextType {
  lang: Language;
  dir: 'ltr' | 'rtl';
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useLanguage = (): LanguageContextType => {
  const lang = useLanguageStore((state) => state.lang);
  const dir = useLanguageStore((state) => state.dir);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const t = useLanguageStore((state) => state.t);

  return { lang, dir, setLanguage, toggleLanguage, t };
};
