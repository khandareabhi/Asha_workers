import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n.ts';
import { useAuth } from './AuthContext';
import { updateUserPreferredLanguage } from '../db/sqlite';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string, opts?: Record<string, any>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

const STATE_LANG_MAP: Record<string, string> = {
  maharashtra: 'mr',
  gujarat: 'gu',
  'west bengal': 'bn',
  tamilnadu: 'ta',
  'tamil nadu': 'ta',
  kerala: 'ml',
  karnataka: 'kn',
  telangana: 'te',
  'andhra pradesh': 'te',
  punjab: 'pa',
  odisha: 'or',
  'uttar pradesh': 'hi',
  bihar: 'hi',
  rajasthan: 'hi',
  'madhya pradesh': 'hi',
  haryana: 'hi',
  delhi: 'hi',
  assam: 'as',
  'jammu and kashmir': 'ur',
};

function detectInitialLanguage(user: any): string {
  // 1) User preference stored
  if (user?.preferred_language) return user.preferred_language;
  // 2) Map by state if available
  const state = String(user?.territory?.state || '').trim().toLowerCase();
  if (state && STATE_LANG_MAP[state]) return STATE_LANG_MAP[state];
  // 3) Device locale
  const device = (typeof navigator !== 'undefined' && (navigator as any).language ? (navigator as any).language.split('-')[0] : 'en');
  // Support only known codes; fallback otherwise
  const supported = ['en','hi','mr','bn','ta','te','kn','ml','gu','pa','or'];
  return supported.includes(device) ? device : 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<string>('en');

  useEffect(() => {
    (async () => {
      // Load from storage first
      const stored = await AsyncStorage.getItem('preferred_language');
      const initial = stored || detectInitialLanguage(user);
      i18n.locale = initial;
      setLanguageState(initial);
    })();
  }, [user?.id]);

  const setLanguage = async (lang: string) => {
    i18n.locale = lang;
    setLanguageState(lang);
    await AsyncStorage.setItem('preferred_language', lang);
    if (user?.id) {
      try { await updateUserPreferredLanguage(user.id, lang); } catch {}
    }
  };

  const value = useMemo(() => ({ language, setLanguage, t: i18n.t.bind(i18n) }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
