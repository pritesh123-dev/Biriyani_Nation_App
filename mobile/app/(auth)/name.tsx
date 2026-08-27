import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useApp } from '../../src/lib/store';
import { api, ApiError } from '../../src/lib/api';
import { GoldButton, ErrorNote } from '../../src/components/ui';
import { C, F, R, S } from '../../src/theme';

/**
 * Shown exactly once, right after a brand-new number verifies its first
 * OTP — this is what makes the phone screen a pure sign-in rather than a
 * sign-up form every returning customer has to sit through. Skippable:
 * a name is nice to have on the profile page, never required to order.
 */
export default function NameScreen() {
  const insets = useSafeAreaInsets();
  const { refreshUser } = useApp();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const finish = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) { router.replace('/(tabs)'); return; }

    setSaving(true);
    setError(null);
    try {
      await api.updateMe({ displayName: trimmed });
      await refreshUser();
      router.replace('/(tabs)');
    } catch (err) {
      // A failed save should never trap someone on this screen — they
      // can always set their name later from the profile page.
      setError(err instanceof ApiError ? err.message : 'Could not save your name.');
    } finally {
      setSaving(false);
    }
  }, [name, refreshUser]);

  return (
    <KeyboardAvoidingView
      style={S.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{
        flex: 1, paddingTop: insets.top + 40,
        paddingHorizontal: 26, paddingBottom: insets.bottom + 26,
      }}>
        <Text style={{ fontFamily: F.serif, fontSize: 34, lineHeight: 37, color: C.text }}>
          What should{'\n'}we call you?
        </Text>
        <Text style={[S.body, { marginTop: 10 }]}>
          Shows up on your profile and your order receipts. You can change it any time.
        </Text>

        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={{
            marginTop: 26, height: 56, borderRadius: R.md, paddingHorizontal: 16,
            justifyContent: 'center', backgroundColor: C.card,
            borderWidth: 1, borderColor: C.goldLine,
          }}
        >
          <TextInput
            ref={inputRef}
            value={name}
            onChangeText={setName}
            placeholder="Ananya Mishra"
            placeholderTextColor={C.text30}
            textContentType="name"
            autoComplete="name"
            returnKeyType="done"
            onSubmitEditing={finish}
            autoFocus
            style={{ fontFamily: F.sans600, fontSize: 16, color: C.text, padding: 0 }}
          />
        </Pressable>

        <View style={{ marginTop: 16 }}>
          <ErrorNote message={error} />
        </View>

        <View style={{ flex: 1 }} />

        <GoldButton
          label={saving ? 'Saving…' : name.trim() ? 'Continue' : 'Skip for now'}
          onPress={finish}
          loading={saving}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
