import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';

import { AppProvider } from '../src/lib/store';
import { C } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => { /* already hidden */ });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
    InstrumentSerif_400Regular,
  });

  useEffect(() => {
    // A missing font should degrade to the system face, never block launch.
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: C.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" options={{ animation: 'fade' }} />
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="cart" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="dish/[id]" />
            <Stack.Screen name="order/[id]" options={{ gestureEnabled: false }} />
          </Stack>
        </View>
      </AppProvider>
    </SafeAreaProvider>
  );
}
