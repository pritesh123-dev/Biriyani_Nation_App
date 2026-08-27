import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import AuthHero from '../../src/components/AuthHero';
import AuthEntryForm from '../../src/components/AuthEntryForm';
import { S } from '../../src/theme';

/** Sign-up: same form as sign-in, refuses a number that's already registered. */
export default function SignupScreen() {
  return (
    <KeyboardAvoidingView
      style={S.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <AuthHero />
        <AuthEntryForm mode="signup" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
