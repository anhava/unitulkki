import { useEffect, useCallback, useState } from "react";
import { Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";

export type ToastType = "success" | "error" | "info" | "warning";

type ToastProps = {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
};

const toastConfig: Record<
  ToastType,
  { icon: React.ComponentProps<typeof FontAwesome>["name"]; color: string; bgColor: string }
> = {
  success: {
    icon: "check-circle",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.15)",
  },
  error: {
    icon: "exclamation-circle",
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.15)",
  },
  info: {
    icon: "info-circle",
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.15)",
  },
  warning: {
    icon: "warning",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.15)",
  },
};

export function Toast({
  visible,
  message,
  type = "info",
  duration = 4000,
  onHide,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const [shouldRender, setShouldRender] = useState(false);

  const config = toastConfig[type];

  // Calculate top position based on safe area
  const topPosition = insets.top + spacing.md;

  const handleAnimationComplete = useCallback(() => {
    setShouldRender(false);
    onHide?.();
  }, [onHide]);

  const hideToast = useCallback(() => {
    translateY.value = withTiming(-100, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(handleAnimationComplete)();
    });
  }, [handleAnimationComplete, translateY, opacity]);

  useEffect(() => {
    if (visible) {
      // Start rendering and animate in
      setShouldRender(true);
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
      });
      opacity.value = withTiming(1, { duration: 300 });

      // Auto-hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else if (shouldRender) {
      // Animate out
      hideToast();
    }
  }, [visible, duration, hideToast, translateY, opacity, shouldRender]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { top: topPosition }, animatedStyle]}>
      <Pressable
        onPress={hideToast}
        style={[styles.toast, { backgroundColor: config.bgColor }]}
      >
        <FontAwesome
          name={config.icon}
          size={20}
          color={config.color}
          style={styles.icon}
        />
        <Text style={[styles.message, { color: config.color }]} numberOfLines={2}>
          {message}
        </Text>
        <FontAwesome
          name="times"
          size={16}
          color={colors.textDim}
          style={styles.closeIcon}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    // Glass effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  closeIcon: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});

export default Toast;
