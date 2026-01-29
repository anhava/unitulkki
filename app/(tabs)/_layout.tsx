import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { colors, typography, spacing } from "@/lib/design-tokens";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// TabBar icon component
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  focused?: boolean;
}) {
  const { focused, ...rest } = props;
  return (
    <View style={focused ? styles.activeIconContainer : undefined}>
      <FontAwesome size={focused ? 24 : 22} style={{ marginBottom: -2 }} {...rest} />
    </View>
  );
}

// Central "New Dream" button - larger and more prominent
function CenterTabIcon({ color, focused }: { color: string; focused: boolean }) {
  return (
    <View style={[styles.centerButton, focused && styles.centerButtonActive]}>
      <FontAwesome name="plus" size={22} color={focused ? colors.white : colors.primary} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Calculate header height for Android (needs to account for status bar)
  const headerHeight = Platform.OS === "android" ? 56 + insets.top : undefined;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: {
          backgroundColor: "rgba(15, 15, 35, 0.98)",
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 6 + insets.bottom,
          height: 64 + insets.bottom,
          // Glass effect simulation
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontFamily: typography.families.body.medium,
          fontSize: 10,
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: colors.background,
          shadowColor: "transparent",
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          height: headerHeight,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: typography.families.heading.semiBold,
          fontSize: 18,
        },
        headerStatusBarHeight: Platform.OS === "android" ? insets.top : undefined,
        // Hide header for home screen (we use custom header in gradient)
        headerShown: false,
      }}
    >
      {/* History - Left side */}
      <Tabs.Screen
        name="history"
        options={{
          title: "Päiväkirja",
          headerShown: true,
          headerTitle: "Unipäiväkirja",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="book" color={color} focused={focused} />
          ),
        }}
      />

      {/* Home/New Dream - Center (main action) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Tulkitse",
          tabBarIcon: ({ color, focused }) => (
            <CenterTabIcon color={color} focused={focused} />
          ),
          tabBarLabelStyle: {
            fontFamily: typography.families.body.semiBold,
            fontSize: 11,
            marginTop: 4,
            color: colors.primary,
          },
        }}
      />

      {/* Settings - Right side (combines patterns + settings) */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Asetukset",
          headerShown: true,
          headerTitle: "Asetukset",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="cog" color={color} focused={focused} />
          ),
        }}
      />

      {/* Hidden - Patterns (accessible from settings or history) */}
      <Tabs.Screen
        name="patterns"
        options={{
          href: null, // Hide from tab bar
          headerShown: true,
          headerTitle: "Unikuviot",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    // Subtle highlight for active state
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${colors.primary}20`,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -16, // Lift above tab bar
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  centerButtonActive: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.05 }],
  },
});
