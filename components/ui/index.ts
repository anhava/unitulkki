/**
 * Unitulkki UI Component Library
 *
 * A glass morphism design system for React Native / Expo.
 *
 * @example
 * // Import individual components
 * import { GlowButton, GlassCard, Badge } from '@/components/ui';
 *
 * // Import everything
 * import * as UI from '@/components/ui';
 */

// =============================================================================
// CORE COMPONENTS
// =============================================================================

/**
 * GlassCard - Glass morphism container with compound component pattern
 *
 * @example
 * <GlassCard intensity="medium" withGradient>
 *   <GlassCard.Header>
 *     <GlassCard.Title>Title</GlassCard.Title>
 *   </GlassCard.Header>
 *   <GlassCard.Body>Content</GlassCard.Body>
 * </GlassCard>
 */
export { GlassCard, useGlassCard } from "./GlassCard";

/**
 * GlowButton - Gradient button with glow effect
 *
 * @example
 * <GlowButton variant="primary" loading={isLoading}>
 *   Save Dream
 * </GlowButton>
 *
 * // With icons
 * <GlowButton leftIcon={<PlusIcon />} variant="accent">
 *   Add New
 * </GlowButton>
 */
export { GlowButton } from "./GlowButton";

// =============================================================================
// FEEDBACK COMPONENTS
// =============================================================================

/**
 * Badge - Status labels, counts, and categorization
 *
 * @example
 * <Badge variant="primary">New</Badge>
 * <Badge variant="success" size="sm">Active</Badge>
 * <Badge dot variant="error" /> // Dot indicator
 */
export { Badge } from "./Badge";

/**
 * Spinner - Loading indicators
 *
 * @example
 * <Spinner size="md" variant="primary" />
 * <DotSpinner variant="accent" />
 * <GradientSpinner size="lg" />
 */
export { Spinner, DotSpinner, GradientSpinner } from "./Spinner";

/**
 * Toast - Notification messages
 */
export { Toast, type ToastType } from "./Toast";

// =============================================================================
// DATA DISPLAY COMPONENTS
// =============================================================================

/**
 * Avatar - User profile images with fallback
 *
 * @example
 * <Avatar src={user.avatar} fallback={user.name} size="lg" status="online" />
 *
 * // Avatar group with overlap
 * <AvatarGroup max={4}>
 *   <Avatar src="..." />
 *   <Avatar src="..." />
 * </AvatarGroup>
 */
export { Avatar, AvatarGroup } from "./Avatar";

// =============================================================================
// INPUT COMPONENTS
// =============================================================================

/**
 * DreamInput - Glass morphism text input
 */
export { DreamInput } from "./DreamInput";

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

/**
 * GradientBackground - Animated gradient background
 */
export { GradientBackground } from "./GradientBackground";

// =============================================================================
// CONTENT COMPONENTS
// =============================================================================

/**
 * MarkdownContent - Renders markdown with dream theme styling
 */
export { MarkdownContent } from "./MarkdownContent";

// =============================================================================
// GAMIFICATION COMPONENTS
// =============================================================================

/**
 * StreakBadge - Displays dream journaling streak with fire animation
 *
 * @example
 * <StreakBadge streak={7} longestStreak={14} />
 * <StreakBadge streak={3} compact />
 */
export { StreakBadge } from "./StreakBadge";

/**
 * QuickActions - Action buttons bar for post-interpretation actions
 *
 * @example
 * <QuickActions actions={[
 *   { icon: "bookmark", label: "Save", color: "#10B981", onPress: handleSave }
 * ]} />
 */
export { QuickActions, useInterpretationActions } from "./QuickActions";

// =============================================================================
// TYPES
// =============================================================================

export type {
  ComponentSize,
  AvatarSize,
  BadgeSize,
  GlassIntensity,
} from "@/lib/design-tokens";
