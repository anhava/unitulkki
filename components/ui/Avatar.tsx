/**
 * Avatar Component
 *
 * Displays user profile images with fallback to initials.
 * Supports multiple sizes and optional status indicators.
 */

import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  colors,
  radius,
  typography,
  componentSizes,
  type AvatarSize,
} from "@/lib/design-tokens";

type AvatarProps = {
  /** Image source URL */
  src?: string | null;
  /** Fallback text (usually initials) */
  fallback?: string;
  /** Size preset */
  size?: AvatarSize;
  /** Online/offline status indicator */
  status?: "online" | "offline" | "busy" | "away";
  style?: ViewStyle;
};

export function Avatar({
  src,
  fallback,
  size = "md",
  status,
  style,
}: AvatarProps) {
  const sizeConfig = componentSizes.avatar[size];
  const statusSize = Math.max(8, sizeConfig.size * 0.25);

  const containerStyle = {
    width: sizeConfig.size,
    height: sizeConfig.size,
    borderRadius: sizeConfig.size / 2,
  };

  const imageStyle: ImageStyle = {
    width: sizeConfig.size,
    height: sizeConfig.size,
    borderRadius: sizeConfig.size / 2,
  };

  return (
    <View style={[styles.wrapper, style]}>
      {src ? (
        <Image
          source={{ uri: src }}
          style={[styles.image, imageStyle]}
          accessibilityLabel={fallback ? `Avatar for ${fallback}` : "Avatar"}
        />
      ) : (
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fallbackContainer, containerStyle]}
        >
          <Text
            style={[
              styles.fallbackText,
              { fontSize: sizeConfig.fontSize },
            ]}
          >
            {getInitials(fallback)}
          </Text>
        </LinearGradient>
      )}

      {status && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: getStatusColor(status),
              // Position at bottom-right
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

/**
 * Avatar Group - displays multiple avatars with overlap
 */
type AvatarGroupProps = {
  children: React.ReactNode;
  /** Maximum avatars to show before +N indicator */
  max?: number;
  size?: AvatarSize;
  style?: ViewStyle;
};

export function AvatarGroup({
  children,
  max = 4,
  size = "md",
  style,
}: AvatarGroupProps) {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;
  const sizeConfig = componentSizes.avatar[size];
  const overlap = sizeConfig.size * 0.3;

  return (
    <View style={[styles.groupContainer, style]}>
      {visibleChildren.map((child, index) => (
        <View
          key={index}
          style={[
            styles.groupItem,
            { marginLeft: index === 0 ? 0 : -overlap, zIndex: visibleChildren.length - index },
          ]}
        >
          {child}
        </View>
      ))}

      {remainingCount > 0 && (
        <View
          style={[
            styles.remainingIndicator,
            {
              width: sizeConfig.size,
              height: sizeConfig.size,
              borderRadius: sizeConfig.size / 2,
              marginLeft: -overlap,
            },
          ]}
        >
          <Text style={[styles.remainingText, { fontSize: sizeConfig.fontSize }]}>
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
}

// Utility functions
function getInitials(text?: string): string {
  if (!text) return "?";
  return text
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getStatusColor(status: "online" | "offline" | "busy" | "away"): string {
  switch (status) {
    case "online":
      return colors.success;
    case "busy":
      return colors.error;
    case "away":
      return colors.warning;
    case "offline":
    default:
      return colors.textDim;
  }
}

// Need React for Children.toArray
import React from "react";

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  image: {
    resizeMode: "cover",
  },
  fallbackContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    fontFamily: typography.families.body.semiBold,
    fontWeight: "600",
    color: colors.white,
  },
  statusIndicator: {
    position: "absolute",
    borderWidth: 2,
    borderColor: colors.background,
  },
  groupContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupItem: {
    borderWidth: 2,
    borderColor: colors.background,
    borderRadius: radius.full,
  },
  remainingIndicator: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  remainingText: {
    fontFamily: typography.families.body.medium,
    fontWeight: "500",
    color: colors.textMuted,
  },
});

export default Avatar;
