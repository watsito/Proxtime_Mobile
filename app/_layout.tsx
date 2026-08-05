import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/providers/AuthProvider';
import { theme } from '../src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" backgroundColor={theme.colors.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen
            name="check-in"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="help"
            options={{
              headerShown: true,
              title: 'Pusat Bantuan',
              headerStyle: { backgroundColor: theme.colors.surface },
              headerTintColor: theme.colors.textPrimary,
              headerTitleStyle: { fontWeight: '700' },
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
