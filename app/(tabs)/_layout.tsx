import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // 🚫 HIDE TAB BAR COMPLETELY
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="index" />
    </Tabs>
  );
}
