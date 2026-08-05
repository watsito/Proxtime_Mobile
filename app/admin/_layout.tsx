import React from 'react';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="leave-approvals" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="employees" />
    </Stack>
  );
}
