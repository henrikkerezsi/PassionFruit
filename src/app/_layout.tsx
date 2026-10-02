import { Stack, ThemeProvider } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import { PassionFruitThemeProvider, useAppTheme } from '../theme';
import { buildNavigationTheme } from '../theme/navigation';
import { DataProvider, useAppData } from '../data/DataProvider';

function ThemedContent() {
  const theme = useAppTheme();
  const navigationTheme = buildNavigationTheme(theme);

  return (
    <ThemeProvider value={navigationTheme}>
      <PaperProvider theme={theme}>
        <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.onSurface,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="record"
            options={{ title: 'Record', presentation: 'modal' }}
          />
        </Stack>
      </PaperProvider>
    </ThemeProvider>
  );
}

function ThemedApp() {
  const { settings } = useAppData();

  return (
    <PassionFruitThemeProvider preference={settings.themeMode}>
      <ThemedContent />
    </PassionFruitThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <DataProvider>
      <ThemedApp />
    </DataProvider>
  );
}
