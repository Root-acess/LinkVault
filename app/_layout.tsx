// app/_layout.tsx
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/useAuth";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { user, loading } = useAuth();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Wait until navigation + auth is ready
    if (loading || !navigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";

    // Case 1: Not logged in → force to welcome
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/welcome");
      return;
    }

    // Case 2: Logged in but stuck in auth group → go to tabs
    if (user && inAuthGroup) {
      router.replace("/(tabs)");
      return;
    }

    // Case 3: Logged in and already in tabs → do nothing
  }, [user, loading, segments, navigationState?.key, router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}