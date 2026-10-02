import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme } from './light';
import { darkTheme } from './dark';
import type { PassionFruitTheme, ThemeMode, ThemePreference } from './types';

const ThemeContext = createContext<PassionFruitTheme>(lightTheme);

export function PassionFruitThemeProvider({
  preference = 'system',
  children,
}: {
  preference?: ThemePreference;
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme();
  const scheme: ThemeMode =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const theme = useMemo(() => (scheme === 'dark' ? darkTheme : lightTheme), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): PassionFruitTheme {
  return useContext(ThemeContext);
}

export { lightTheme, darkTheme };
export type { PassionFruitTheme, ThemeMode, ThemePreference, ThemeColors, BrandTokens } from './types';
