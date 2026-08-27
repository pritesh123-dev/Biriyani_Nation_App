import React from 'react';
import { Stack } from 'expo-router';
import { C } from '../../src/theme';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
      <Stack.Screen name="phone" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="name" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
