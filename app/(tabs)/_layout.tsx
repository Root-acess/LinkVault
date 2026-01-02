// app/(tabs)/_layout.tsx
import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="scaner" options={{ title: 'Scanner' }} />
    </Stack>
  );
}