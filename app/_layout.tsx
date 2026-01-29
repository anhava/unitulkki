import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";

// Import NativeWind global styles
import "../global.css";

import { useColorScheme } from "@/components/useColorScheme";
import { useDreamFonts } from "@/lib/fonts";
import { colors } from "@/lib/design-tokens";
import { initHaptics } from "@/lib/haptics";
import { PremiumProvider, usePremium } from "@/contexts";
import { PremiumModal } from "@/components/premium";
import { initializeAnalytics } from "@/lib/analytics";
import {
  initializeNotifications,
  handleNotificationResponse,
} from "@/lib/notifications";
import { initializeIAP } from "@/lib/iap";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom dark theme for Unitulkki - Deep purple glassmorphism aesthetic
const DreamDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: "rgba(26, 10, 46, 0.8)", // Semi-transparent for glass effect
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

export default function RootLayout() {
  // Load FontAwesome icons
  const [iconFontsLoaded] = useFonts({
    ...FontAwesome.font,
  });

  // Load custom fonts (Inter, Space Grotesk)
  const { loaded: customFontsLoaded, error } = useDreamFonts();

  const allFontsLoaded = iconFontsLoaded && customFontsLoaded;

  // Track notification response listener
  const notificationResponseListener = useRef<Notifications.EventSubscription | null>(null);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (allFontsLoaded) {
      // Initialize core services
      initHaptics();
      initializeAnalytics();
      initializeIAP();

      // Initialize notifications (channels, categories, action buttons)
      initializeNotifications();

      // Add notification response listener for alarm actions
      notificationResponseListener.current =
        Notifications.addNotificationResponseReceivedListener(
          handleNotificationResponse
        );

      SplashScreen.hideAsync();
    }

    // Cleanup listener on unmount
    return () => {
      if (notificationResponseListener.current) {
        notificationResponseListener.current.remove();
      }
    };
  }, [allFontsLoaded]);

  if (!allFontsLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Always use dark theme for DreamAI aesthetic
  return (
    <SafeAreaProvider>
      <PremiumProvider>
        <ThemeProvider value={DreamDarkTheme}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
              contentStyle: {
                backgroundColor: colors.background,
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                headerStyle: {
                  backgroundColor: colors.backgroundGradientStart,
                },
              }}
            />
          </Stack>
          <PremiumModalWrapper />
        </ThemeProvider>
      </PremiumProvider>
    </SafeAreaProvider>
  );
}

// Separate component to use usePremium hook
function PremiumModalWrapper() {
  const { showPremiumModal, closePremiumModal } = usePremium();
  return (
    <PremiumModal
      visible={showPremiumModal}
      onClose={closePremiumModal}
    />
  );
}
