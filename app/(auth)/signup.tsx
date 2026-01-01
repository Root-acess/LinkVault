import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

export default function SignUpPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // ── Theme tokens (SAME AS SIGN-IN) ─────────────────────────────
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
    [primary, primarySoft, accent, bg, cardBg, inputBg, inputBorder, text, textMuted, divider, isDark]
  );

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email || !username || !password || !confirm) {
      alert('Please fill all fields');
      return;
    }

    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={[styles.root, { backgroundColor: raw.bg }]}>
      {/* Background blobs (same as sign-in) */}
      <View style={[styles.bgBlob, { backgroundColor: raw.primary }]} />
      <View style={[styles.bgBlobRight, { backgroundColor: raw.accent }]} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Card */}
        <View style={[styles.card, { backgroundColor: raw.cardBg }]}>
          {/* Logo */}
          <View style={[styles.logoWrap, { backgroundColor: raw.primary }]}>
            <ThemedText style={styles.logoText}>LV</ThemedText>
          </View>

          {/* Title */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <ThemedText style={[styles.appTitle, { color: raw.text }]}>
              Create Account
            </ThemedText>
            <ThemedText style={{ color: raw.textMuted, fontSize: 13 }}>
              Join LinkVolt and power your links
            </ThemedText>
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

          {/* Username */}
          <View style={{ height: 14 }} />
          <ThemedText style={[styles.label, { color: raw.text }]}>Username</ThemedText>
          <TextInput
            style={[
              styles.input,
              focused === 'username' && styles.inputFocused,
              { backgroundColor: raw.inputBg, borderColor: raw.inputBorder, color: raw.text },
            ]}
            placeholder="Choose a username"
            placeholderTextColor={raw.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            onFocus={() => setFocused('username')}
            onBlur={() => setFocused(null)}
          />

          {/* Password */}
          <View style={{ height: 14 }} />
          <ThemedText style={[styles.label, { color: raw.text }]}>Password</ThemedText>
          <TextInput
            style={[
              styles.input,
              focused === 'password' && styles.inputFocused,
              { backgroundColor: raw.inputBg, borderColor: raw.inputBorder, color: raw.text },
            ]}
            placeholder="Create password"
            placeholderTextColor={raw.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
          />

          {/* Confirm */}
          <View style={{ height: 14 }} />
          <ThemedText style={[styles.label, { color: raw.text }]}>Confirm Password</ThemedText>
          <TextInput
            style={[
              styles.input,
              focused === 'confirm' && styles.inputFocused,
              { backgroundColor: raw.inputBg, borderColor: raw.inputBorder, color: raw.text },
            ]}
            placeholder="Repeat password"
            placeholderTextColor={raw.textMuted}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            onFocus={() => setFocused('confirm')}
            onBlur={() => setFocused(null)}
          />

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cta, loading && styles.ctaDisabled, { backgroundColor: raw.primary }]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.9}
          >
            <ThemedText style={styles.ctaText}>
              {loading ? 'Creating account…' : 'Create account'}
            </ThemedText>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.signUpRow}>
            <ThemedText style={[styles.smallText, { color: raw.textMuted }]}>
              Already have an account?
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
              <ThemedText style={[styles.signUpLink, { color: raw.primary }]}>
                {' '}Sign in
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* ── SAME STYLE FACTORY AS SIGN-IN ───────────────────────────── */

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
  const { primary, accent, bg, cardBg, inputBg, inputBorder, text, textMuted, divider, isDark } = raw;

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

    appTitle: {
      fontSize: 26,
      fontWeight: '900',
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
