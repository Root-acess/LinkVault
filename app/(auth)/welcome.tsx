import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomePage() {
  const router = useRouter();

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const titleGlow = useRef(new Animated.Value(0.4)).current;
  const orb1Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const orb2Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const orb3Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    // Entrance sequence
    Animated.sequence([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(titleGlow, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(titleGlow, {
            toValue: 0.4,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ),
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(orb1Pos.y, {
              toValue: -20,
              duration: 4000,
              easing: Easing.sin,
              useNativeDriver: true,
            }),
            Animated.timing(orb1Pos.y, {
              toValue: 20,
              duration: 4000,
              easing: Easing.sin,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(orb2Pos.y, {
              toValue: -30,
              duration: 5200,
              easing: Easing.sin,
              useNativeDriver: true,
            }),
            Animated.timing(orb2Pos.y, {
              toValue: 30,
              duration: 5200,
              easing: Easing.sin,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(orb3Pos.y, {
              toValue: -15,
              duration: 4600,
              easing: Easing.sin,
              useNativeDriver: true,
            }),
            Animated.timing(orb3Pos.y, {
              toValue: 15,
              duration: 4600,
              easing: Easing.sin,
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    ]).start();
  }, []); // Removed router dependency + auto-redirect timer

  const glowStyle = {
    textShadowColor: '#8b5cf6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: titleGlow.interpolate({
      inputRange: [0.4, 1],
      outputRange: [8, 28],
    }),
  };

  // Press feedback (scale down slightly on press)
  const handlePressIn = () => {
    Animated.spring(new Animated.Value(0.96), {
      toValue: 0.96,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(new Animated.Value(1), {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#0a0e17', '#0f1325', '#1a1f38']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating orbs – futuristic 3D feel */}
      <Animated.View style={[styles.orb, styles.orb1, { transform: orb1Pos.getTranslateTransform() }]} />
      <Animated.View style={[styles.orb, styles.orb2, { transform: orb2Pos.getTranslateTransform() }]} />
      <Animated.View style={[styles.orb, styles.orb3, { transform: orb3Pos.getTranslateTransform() }]} />

      <Animated.View style={{ opacity: fadeIn, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {/* Title with glow */}
        <Animated.Text style={[styles.title, glowStyle]}>
          LINKVAULT
        </Animated.Text>

        {/* Tagline */}
        <ThemedText style={styles.subtitle}>
          Your links. Synced. Secure. Everywhere.
        </ThemedText>

        {/* Subtle futuristic line */}
        <View style={styles.neonLine} />

        {/* Buttons with press feedback */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => router.push('/(auth)/signin')}
          >
            <Animated.View style={styles.buttonGlow}>
              <ThemedText type="link" style={styles.btn}>
                Sign In
              </ThemedText>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Animated.View style={styles.buttonGlow}>
              <ThemedText type="link" style={[styles.btn, styles.btnOutline]}>
                Register
              </ThemedText>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e17',
  },
  title: {
    fontSize: 54,
    fontWeight: '900',
    color: '#f1f5f9',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 1.5,
    maxWidth: '80%',
    opacity: 0.9,
  },
  neonLine: {
    width: SCREEN_WIDTH * 0.6,
    height: 2,
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
    opacity: 0.45,
    marginVertical: 24,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    shadowOpacity: 0.7,
    shadowRadius: 30,
  },
  orb1: {
    width: 220,
    height: 220,
    backgroundColor: '#7c3aed',
    top: '12%',
    left: '-25%',
    opacity: 0.11,
    shadowColor: '#7c3aed',
  },
  orb2: {
    width: 300,
    height: 300,
    backgroundColor: '#06b6d4',
    bottom: '8%',
    right: '-35%',
    opacity: 0.08,
    shadowColor: '#06b6d4',
  },
  orb3: {
    width: 160,
    height: 160,
    backgroundColor: '#a78bfa',
    top: '45%',
    right: '15%',
    opacity: 0.10,
    shadowColor: '#a78bfa',
  },
  buttonContainer: {
    marginTop: 48,
    alignItems: 'center',
    gap: 20,
  },
  btn: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 56,
    backgroundColor: '#7c3aed',
    borderRadius: 30,
    overflow: 'hidden',
    textAlign: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 14,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2.5,
    borderColor: '#8b5cf6',
    color: '#c4b5fd',
    shadowColor: '#8b5cf6',
  },
  buttonGlow: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
});