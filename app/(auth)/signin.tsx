import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

export default function SignInPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // ── Theme tokens ───────────────────────────────────────────────
  const primary = isDark ? '#8b5cf6' : '#7c3aed';
  const primarySoft = isDark ? '#a78bfa' : '#c4b5fd';
  const accent = '#06b6d4';

  const bg = isDark ? '#0a0e17' : '#f8fafc';
  const cardBg = isDark ? '#111827' : '#ffffff';

  const inputBg = isDark ? '#1e293b' : '#f1f5f9';
  const inputBorder = isDark ? '#334155' : '#e2e8f0';

  const text = isDark ? '#f1f5f9' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const divider = isDark ? '#334155' : '#e2e8f0';

  const { styles, raw } = useMemo(
    () =>
      makeStyles({
        primary,
        primarySoft,
        accent,
        bg,
        cardBg,
        inputBg,
        inputBorder,
        text,
        textMuted,
        divider,
        isDark,
      }),
    [
      primary,
      primarySoft,
      accent,
      bg,
      cardBg,
      inputBg,
      inputBorder,
      text,
      textMuted,
      divider,
      isDark,
    ]
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      alert(error.message || 'Invalid credentials');
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={[styles.root, { backgroundColor: raw.bg }]}>
      {/* Background glow blobs */}
      <View style={[styles.bgBlob, { backgroundColor: raw.primary }]} />
      <View style={[styles.bgBlobRight, { backgroundColor: raw.accent }]} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
    

        {/* Card */}
        <View style={[styles.card, { backgroundColor: raw.cardBg }]}>
          {/* Logo */}
          <View style={[styles.logoWrap, { backgroundColor: raw.primary }]}>
            <ThemedText style={styles.logoText}>LV</ThemedText>
          </View>

          {/* Email */}
          <ThemedText style={[styles.label, { color: raw.text }]}>Email</ThemedText>
          <TextInput
            style={[
              styles.input,
              focused === 'email' && styles.inputFocused,
              { backgroundColor: raw.inputBg, borderColor: raw.inputBorder, color: raw.text },
            ]}
            placeholder="you@example.com"
            placeholderTextColor={raw.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
          />

          {/* Password */}
          <View style={{ height: 14 }} />

          <ThemedText style={[styles.label, { color: raw.text }]}>Password</ThemedText>
          <View style={styles.passwordRow}>
            <TextInput
              style={[
                styles.input,
                focused === 'password' && styles.inputFocused,
                {
                  flex: 1,
                  backgroundColor: raw.inputBg,
                  borderColor: raw.inputBorder,
                  color: raw.text,
                },
              ]}
              placeholder="Enter password"
              placeholderTextColor={raw.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            />

            <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.showBtn}>
              <ThemedText style={{ color: raw.primary, fontWeight: '800' }}>
                {showPassword ? 'Hide' : 'Show'}
              </ThemedText>
            </Pressable>
          </View>

          {/* Remember / Forgot */}
          <View style={styles.row}>
            <View style={styles.rememberRow}>
              <Switch
                value={remember}
                onValueChange={setRemember}
                trackColor={{ true: raw.primary, false: divider }}
                thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
              />
              <ThemedText style={[styles.rememberText, { color: raw.textMuted }]}>
                Remember me
              </ThemedText>
            </View>

            <TouchableOpacity onPress={() => alert('Reset flow not implemented')}>
              <ThemedText style={[styles.forgotText, { color: raw.primary }]}>
                Forgot?
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cta, loading && styles.ctaDisabled, { backgroundColor: raw.primary }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            <ThemedText style={styles.ctaText}>
              {loading ? 'Signing in…' : 'Sign in'}
            </ThemedText>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.signUpRow}>
            <ThemedText style={[styles.smallText, { color: raw.textMuted }]}>
              Don’t have an account?
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <ThemedText style={[styles.signUpLink, { color: raw.primary }]}>
                {' '}Sign up
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* ── Styles factory ───────────────────────────────────────────── */

const makeStyles = (raw: {
  primary: string;
  primarySoft: string;
  accent: string;
  bg: string;
  cardBg: string;
  inputBg: string;
  inputBorder: string;
  text: string;
  textMuted: string;
  divider: string;
  isDark: boolean;
}) => {
  const {
    primary,
    accent,
    bg,
    cardBg,
    inputBg,
    inputBorder,
    text,
    textMuted,
    divider,
    isDark,
  } = raw;

  const styles = StyleSheet.create({
    root: { flex: 1 },

    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 40,
    },

    bgBlob: {
      position: 'absolute',
      width: 260,
      height: 260,
      borderRadius: 140,
      left: -90,
      top: -70,
      opacity: 0.08,
    },
    bgBlobRight: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 110,
      right: -70,
      bottom: -70,
      opacity: 0.06,
    },

    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    appTitle: {
      fontSize: 36,
      fontWeight: '900',
      color: text,
      letterSpacing: 1,
    },
    tagline: {
      marginTop: 6,
      fontSize: 14,
    },

    card: {
      borderRadius: 20,
      padding: 22,
      borderWidth: isDark ? 1 : 0,
      borderColor: divider,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.6 : 0.08,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 10,
    },

    logoWrap: {
      width: 72,
      height: 72,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: -48,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    logoText: {
      color: '#fff',
      fontWeight: '900',
      fontSize: 20,
      letterSpacing: 1,
    },

    label: {
      fontSize: 13,
      fontWeight: '800',
      marginBottom: 8,
    },

    input: {
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 15,
    },

    inputFocused: {
      borderColor: primary,
      shadowColor: primary,
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },

    passwordRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    showBtn: {
      marginLeft: 12,
      paddingHorizontal: 8,
      paddingVertical: 6,
    },

    row: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    rememberRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rememberText: {
      marginLeft: 8,
      fontSize: 13,
    },

    forgotText: {
      fontSize: 13,
      fontWeight: '800',
    },

    cta: {
      marginTop: 20,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    ctaDisabled: {
      opacity: 0.6,
    },
    ctaText: {
      color: '#fff',
      fontWeight: '900',
      fontSize: 16,
      letterSpacing: 0.5,
    },

    signUpRow: {
      marginTop: 18,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    smallText: {
      fontSize: 13,
    },
    signUpLink: {
      fontWeight: '900',
      fontSize: 13,
    },
  });

  return { styles, raw };
};
