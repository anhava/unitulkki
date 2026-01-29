import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import {
  useFonts as useSpaceGroteskFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";

// Font family names for use in styles
export const fonts = {
  // Body text
  inter: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    // Note: Using regular with fontStyle for italic since Inter doesn't have native italic
    italic: "Inter_400Regular",
  },
  // Headings
  spaceGrotesk: {
    regular: "SpaceGrotesk_400Regular",
    medium: "SpaceGrotesk_500Medium",
    semiBold: "SpaceGrotesk_600SemiBold",
    bold: "SpaceGrotesk_700Bold",
  },
} as const;

// Combined font loading hook
export function useDreamFonts() {
  const [interLoaded, interError] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [spaceGroteskLoaded, spaceGroteskError] = useSpaceGroteskFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  const loaded = interLoaded && spaceGroteskLoaded;
  const error = interError || spaceGroteskError;

  return { loaded, error };
}

// Re-export colors from design-tokens for backward compatibility
// New code should import from @/lib/design-tokens directly
export { colors } from "./design-tokens";
