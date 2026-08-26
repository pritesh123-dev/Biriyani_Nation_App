import React from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '../src/lib/store';
import { Loading } from '../src/components/ui';
import { C } from '../src/theme';

/** Boot gate: waits for cached state, then routes to sign-in or the app. */
export default function Index() {
  const { ready, signedIn } = useApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Loading />
      </View>
    );
  }

  return <Redirect href={signedIn ? '/(tabs)' : '/(auth)/phone'} />;
}
