import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import { GradientBackground, GlassCard, Toast } from "@/components/ui";
import { DreamCard } from "@/components/DreamCard";
import { DreamDetailModal } from "@/components/DreamDetailModal";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import {
  getDreams,
  deleteDream,
  getDreamStats,
  type Dream,
} from "@/lib/storage";
import { useToast } from "@/hooks/useToast";

export default function HistoryScreen() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    thisWeek: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { toast, showSuccess, showError, hideToast } = useToast();

  // Load dreams
  const loadDreams = useCallback(async () => {
    try {
      const [loadedDreams, loadedStats] = await Promise.all([
        getDreams(),
        getDreamStats(),
      ]);
      setDreams(loadedDreams);
      setStats({
        total: loadedStats.total,
        thisWeek: loadedStats.thisWeek,
      });
    } catch (error) {
      console.error("Error loading dreams:", error);
      showError("Unien lataaminen epäonnistui");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showError]);

  // Initial load
  useEffect(() => {
    loadDreams();
  }, [loadDreams]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadDreams();
  }, [loadDreams]);

  // Open dream detail
  const handleDreamPress = useCallback((dream: Dream) => {
    setSelectedDream(dream);
    setModalVisible(true);
  }, []);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    // Clear selected dream after animation
    setTimeout(() => setSelectedDream(null), 300);
  }, []);

  // Delete dream
  const handleDeleteDream = useCallback(
    async (dream: Dream) => {
      try {
        await deleteDream(dream.id);
        setDreams((prev) => prev.filter((d) => d.id !== dream.id));
        setStats((prev) =>
          prev ? { ...prev, total: prev.total - 1 } : null
        );
        showSuccess("Uni poistettu");
      } catch (error) {
        console.error("Error deleting dream:", error);
        showError("Unen poistaminen epäonnistui");
      }
    },
    [showSuccess, showError]
  );

  // Render empty state
  if (!isLoading && dreams.length === 0) {
    return (
      <GradientBackground safeAreaTop={false}>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.emptyContainer}
        >
          <View style={styles.emptyIconContainer}>
            <FontAwesome name="moon-o" size={48} color={colors.textDim} />
          </View>
          <Text style={styles.emptyTitle}>Ei vielä tallennettuja unia</Text>
          <Text style={styles.emptySubtitle}>
            Aloita kertomalla unesi kotisivulla.{"\n"}
            Tulkinta tallennetaan automaattisesti.
          </Text>
          <View style={styles.emptyHint}>
            <FontAwesome name="lightbulb-o" size={14} color={colors.accent} />
            <Text style={styles.emptyHintText}>
              Vinkki: Pidä unipäiväkirjaa nähdäksesi kuvioita unissasi
            </Text>
          </View>
        </Animated.View>
      </GradientBackground>
    );
  }

  // Render list header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Stats cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <GlassCard intensity="light" style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Unta tallennettu</Text>
          </GlassCard>
          <GlassCard intensity="light" style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.thisWeek}</Text>
            <Text style={styles.statLabel}>Tällä viikolla</Text>
          </GlassCard>
        </View>
      )}

      {/* Quick link to patterns */}
      {stats && stats.total >= 3 && (
        <Pressable
          onPress={() => router.push("/patterns")}
          style={({ pressed }) => [
            styles.patternsLink,
            pressed && styles.patternsLinkPressed,
          ]}
        >
          <FontAwesome name="line-chart" size={16} color={colors.accent} />
          <Text style={styles.patternsLinkText}>Näytä unikuviot ja trendit</Text>
          <FontAwesome name="chevron-right" size={14} color={colors.textDim} />
        </Pressable>
      )}

      {/* Section title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Unihistoria</Text>
        <Text style={styles.sectionSubtitle}>
          Pyyhkäise vasemmalle poistaaksesi
        </Text>
      </View>
    </View>
  );

  // Render empty list component
  const renderEmptyComponent = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Ladataan...</Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <GradientBackground safeAreaTop={false}>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />

        <FlatList
          data={dreams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DreamCard
              dream={item}
              onPress={handleDreamPress}
              onDelete={handleDeleteDream}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={isLoading ? renderEmptyComponent : null}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />

        {/* Dream detail modal */}
        <DreamDetailModal
          dream={selectedDream}
          visible={modalVisible}
          onClose={handleCloseModal}
          onDelete={handleDeleteDream}
        />
      </GradientBackground>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: typography.sizes.xl,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  emptyHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  emptyHintText: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    flex: 1,
  },
  // List
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  // Header
  headerContainer: {
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  patternsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: `${colors.accent}15`,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.accent}30`,
    marginBottom: spacing.lg,
  },
  patternsLinkPressed: {
    backgroundColor: `${colors.accent}25`,
  },
  patternsLinkText: {
    flex: 1,
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.accent,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  statNumber: {
    fontFamily: typography.families.heading.bold,
    fontSize: typography.sizes.xxl + 4,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wider,
  },
  sectionSubtitle: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
    marginTop: spacing.xs,
  },
  // Loading
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  loadingText: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
