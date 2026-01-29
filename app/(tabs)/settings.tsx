import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { router } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInUp } from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePremium } from "@/contexts";
import {
  getNotificationSettings,
  toggleNotifications,
  sendTestNotification,
  formatNotificationTime,
  updateNotificationTime,
  getScheduledNotifications,
} from "@/lib/notifications";
import { exportDreamsAsPdf } from "@/lib/pdf-export";
import { getDreams } from "@/lib/storage";

import { GradientBackground, GlassCard, GlowButton, Toast } from "@/components/ui";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import { clearAllDreams, getDreamStats } from "@/lib/storage";
import haptics, { getHapticsEnabled, setHapticsEnabled } from "@/lib/haptics";
import { useToast } from "@/hooks/useToast";

// Storage keys
const LANGUAGE_KEY = "@unitulkki_language";
const INTERPRETATION_LENGTH_KEY = "@unitulkki_interpretation_length";

// Types
type Language = "fi" | "en";
type InterpretationLength = "short" | "normal" | "long";

// Time picker state
type TimePickerMode = 'time' | 'hidden';

// Translations
const translations = {
  fi: {
    settings: "Asetukset",
    language: "Kieli",
    finnish: "Suomi",
    english: "Englanti",
    preferences: "Asetukset",
    hapticFeedback: "Tärinäpalaute",
    hapticDescription: "Tuntoaistipalaute painikkeille",
    interpretationLength: "Tulkinnan pituus",
    short: "Lyhyt",
    normal: "Normaali",
    long: "Pitkä",
    dataManagement: "Tietojen hallinta",
    clearHistory: "Tyhjennä unihistoria",
    clearHistoryDescription: "Poista kaikki tallennetut unet",
    clearConfirmTitle: "Tyhjennä historia?",
    clearConfirmMessage: "Tämä poistaa kaikki tallennetut unet pysyvästi. Toimintoa ei voi perua.",
    cancel: "Peruuta",
    delete: "Poista",
    about: "Tietoja",
    version: "Versio",
    madeWith: "Tehty AI SDK:lla & Aihio AI",
    privacyPolicy: "Tietosuojakäytäntö",
    dreamCount: "tallennettua unta",
    cleared: "Historia tyhjennetty",
  },
  en: {
    settings: "Settings",
    language: "Language",
    finnish: "Finnish",
    english: "English",
    preferences: "Preferences",
    hapticFeedback: "Haptic Feedback",
    hapticDescription: "Tactile feedback for buttons",
    interpretationLength: "Interpretation Length",
    short: "Short",
    normal: "Normal",
    long: "Long",
    dataManagement: "Data Management",
    clearHistory: "Clear Dream History",
    clearHistoryDescription: "Delete all saved dreams",
    clearConfirmTitle: "Clear history?",
    clearConfirmMessage: "This will permanently delete all saved dreams. This action cannot be undone.",
    cancel: "Cancel",
    delete: "Delete",
    about: "About",
    version: "Version",
    madeWith: "Made with AI SDK & Aihio AI",
    privacyPolicy: "Privacy Policy",
    dreamCount: "saved dreams",
    cleared: "History cleared",
  },
};

// Selection button component
function SelectionButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onPress();
      }}
      style={[styles.selectionButton, selected && styles.selectionButtonSelected]}
    >
      <Text
        style={[
          styles.selectionButtonText,
          selected && styles.selectionButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Setting row component
function SettingRow({
  icon,
  iconColor = colors.textMuted,
  title,
  description,
  children,
}: {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  iconColor?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: `${iconColor}15` }]}>
        <FontAwesome name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <View style={styles.settingAction}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const [language, setLanguage] = useState<Language>("fi");
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);
  const [interpretationLength, setInterpretationLength] = useState<InterpretationLength>("normal");
  const [dreamCount, setDreamCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState("08:00");
  const [isExporting, setIsExporting] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<TimePickerMode>('hidden');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { isPremium, isTrialActive, openPremiumModal, trialDaysRemaining } = usePremium();
  const hasPremiumAccess = isPremium || isTrialActive;

  const t = translations[language];

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [storedLanguage, storedLength, hapticsOn, stats, notifSettings] = await Promise.all([
          AsyncStorage.getItem(LANGUAGE_KEY),
          AsyncStorage.getItem(INTERPRETATION_LENGTH_KEY),
          getHapticsEnabled(),
          getDreamStats(),
          getNotificationSettings(),
        ]);

        if (storedLanguage === "en" || storedLanguage === "fi") {
          setLanguage(storedLanguage);
        }
        if (storedLength === "short" || storedLength === "normal" || storedLength === "long") {
          setInterpretationLength(storedLength);
        }
        setHapticsEnabledState(hapticsOn);
        setDreamCount(stats.total);
        setNotificationsEnabled(notifSettings.enabled);
        setNotificationTime(formatNotificationTime(notifSettings.hour, notifSettings.minute));
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  // Save language
  const handleLanguageChange = useCallback(async (lang: Language) => {
    haptics.selection();
    setLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

  // Save haptics
  const handleHapticsToggle = useCallback(async (enabled: boolean) => {
    if (enabled) {
      haptics.light();
    }
    setHapticsEnabledState(enabled);
    await setHapticsEnabled(enabled);
  }, []);

  // Save interpretation length
  const handleLengthChange = useCallback(async (length: InterpretationLength) => {
    haptics.selection();
    setInterpretationLength(length);
    await AsyncStorage.setItem(INTERPRETATION_LENGTH_KEY, length);
  }, []);

  // Toggle notifications
  const handleNotificationsToggle = useCallback(async (enabled: boolean) => {
    haptics.selection();
    const success = await toggleNotifications(enabled);
    if (success) {
      setNotificationsEnabled(enabled);
      if (enabled) {
        showSuccess(`Herätys asetettu klo ${notificationTime}`);
      } else {
        showSuccess("Herätys poistettu käytöstä");
      }
    } else {
      showError("Herätysten käyttöönotto epäonnistui. Tarkista sovelluksen luvat.");
    }
  }, [showSuccess, showError, notificationTime]);

  // Test alarm
  const handleTestAlarm = useCallback(async () => {
    haptics.light();
    try {
      await sendTestNotification();
      showSuccess("Testiherätys lähetetty!");
    } catch (error) {
      showError("Testiherätys epäonnistui. Tarkista luvat.");
    }
  }, [showSuccess, showError]);

  // Handle time change
  const handleTimeChange = useCallback((event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setSelectedTime(selectedDate);
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setNotificationTime(formattedTime);
      
      // Update notification time in storage
      updateNotificationTime(hours, minutes);
      
      // If notifications are enabled, reschedule with new time
      if (notificationsEnabled) {
        toggleNotifications(false).then(() => {
          toggleNotifications(true);
        });
        showSuccess(`Herätysaika asetettu: ${formattedTime}`);
      }
    }
    
    // Close the time picker
    setTimePickerMode('hidden');
  }, [notificationsEnabled, toggleNotifications, showSuccess]);

  // Open time picker
  const openTimePicker = useCallback(() => {
    haptics.selection();
    // Set the current notification time as the initial time in the picker
    const [hours, minutes] = notificationTime.split(':').map(Number);
    const now = new Date();
    now.setHours(hours || 8);
    now.setMinutes(minutes || 0);
    setSelectedTime(now);
    setTimePickerMode('time');
  }, [notificationTime]);

  
  const handleExportPdf = useCallback(async () => {
    if (!hasPremiumAccess) {
      openPremiumModal();
      return;
    }

    haptics.light();
    setIsExporting(true);
    try {
      const dreams = await getDreams();
      if (dreams.length === 0) {
        showError("Ei vietäviä unia");
        return;
      }
      await exportDreamsAsPdf(dreams, "Unipäiväkirja");
      showSuccess("PDF luotu");
    } catch (error) {
      console.error("Export error:", error);
      showError("PDF-vienti epäonnistui");
    } finally {
      setIsExporting(false);
    }
  }, [hasPremiumAccess, openPremiumModal, showSuccess, showError]);

  // Clear history
  const handleClearHistory = useCallback(() => {
    haptics.warning();
    Alert.alert(
      t.clearConfirmTitle,
      t.clearConfirmMessage,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.delete,
          style: "destructive",
          onPress: async () => {
            try {
              haptics.heavy();
              await clearAllDreams();
              setDreamCount(0);
              showSuccess(t.cleared);
            } catch (error) {
              haptics.error();
              showError("Virhe historian tyhjentämisessä");
            }
          },
        },
      ]
    );
}, [t, showSuccess, showError]);

  const PRIVACY_POLICY_URL = "https://unitulkki.site/tietosuoja";
  const openPrivacyPolicy = useCallback(() => {
    haptics.light();
    Linking.openURL(PRIVACY_POLICY_URL);
  }, []);

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  return (
    <GradientBackground safeAreaTop={false}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(400).delay(0)}>
          <Text style={styles.header}>{t.settings}</Text>
        </Animated.View>

        {/* Premium Status */}
        <Animated.View entering={FadeInUp.duration(400).delay(50)}>
          <Pressable onPress={openPremiumModal}>
            <GlassCard intensity="medium" withGradient style={styles.premiumCard}>
              <View style={styles.premiumIcon}>
                <FontAwesome
                  name={isPremium ? "diamond" : isTrialActive ? "clock-o" : "lock"}
                  size={24}
                  color={isPremium ? colors.accent : isTrialActive ? colors.primary : colors.textMuted}
                />
              </View>
              <View style={styles.premiumContent}>
                <Text style={styles.premiumTitle}>
                  {isPremium ? "Premium-käyttäjä" : isTrialActive ? `Kokeilu (${trialDaysRemaining} pv)` : "Ilmaisversio"}
                </Text>
                <Text style={styles.premiumSubtitle}>
                  {isPremium
                    ? "Kaikki ominaisuudet käytössä"
                    : isTrialActive
                    ? "Kokeile kaikkia ominaisuuksia"
                    : "Päivitä Premium-versioon"}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={colors.textDim} />
            </GlassCard>
          </Pressable>
        </Animated.View>

        {/* Language Section */}
        <Animated.View entering={FadeInUp.duration(400).delay(100)}>
          <Text style={styles.sectionLabel}>{t.language}</Text>
          <GlassCard intensity="medium" style={styles.card}>
            <View style={styles.selectionGroup}>
              <SelectionButton
                label={`🇫🇮 ${t.finnish}`}
                selected={language === "fi"}
                onPress={() => handleLanguageChange("fi")}
              />
              <SelectionButton
                label={`🇬🇧 ${t.english}`}
                selected={language === "en"}
                onPress={() => handleLanguageChange("en")}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Insights Section - Link to Patterns */}
        <Animated.View entering={FadeInUp.duration(400).delay(125)}>
          <Text style={styles.sectionLabel}>Analytiikka</Text>
          <GlassCard intensity="medium" style={styles.card}>
            <Pressable
              onPress={() => {
                haptics.light();
                router.push("/patterns");
              }}
              style={({ pressed }) => [
                styles.linkRow,
                pressed && styles.linkRowPressed,
              ]}
            >
              <View style={[styles.settingIcon, { backgroundColor: `${colors.accent}15` }]}>
                <FontAwesome name="line-chart" size={18} color={colors.accent} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Unikuviot</Text>
                <Text style={styles.settingDescription}>Teemat, symbolit ja trendit unissasi</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={colors.textDim} />
            </Pressable>
          </GlassCard>
        </Animated.View>

        {/* Alarm Section */}
        <Animated.View entering={FadeInUp.duration(400).delay(150)}>
          <Text style={styles.sectionLabel}>Uniherätys</Text>
          <GlassCard intensity="medium" style={styles.card}>
            <SettingRow
              icon="bell"
              iconColor={colors.primary}
              title="Aamuherätys"
              description={notificationsEnabled ? `Herätys klo ${notificationTime}` : "Ei käytössä"}
            >
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.surface, true: colors.primary }}
                thumbColor={colors.white}
              />
            </SettingRow>
            <View style={styles.divider} />
            <Pressable
              onPress={openTimePicker}
              style={styles.timePickerButton}
            >
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: `${colors.accent}15` }]}>
                  <FontAwesome name="clock-o" size={18} color={colors.accent} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Herätysaika</Text>
                  <Text style={styles.settingDescription}>Valitse milloin herätys tulee</Text>
                </View>
                <Text style={styles.timeDisplay}>{notificationTime}</Text>
                <FontAwesome name="chevron-right" size={16} color={colors.textDim} style={{ marginLeft: 8 }} />
              </View>
            </Pressable>
            <View style={styles.divider} />
            {/* Test Alarm Button */}
            <Pressable
              onPress={handleTestAlarm}
              style={({ pressed }) => [
                styles.testAlarmButton,
                pressed && styles.testAlarmButtonPressed,
              ]}
            >
              <FontAwesome name="volume-up" size={16} color={colors.accent} />
              <Text style={styles.testAlarmText}>Testaa herätys</Text>
            </Pressable>
            <Text style={styles.alarmInfoText}>
              Herätys muistuttaa sinua kirjaamaan unesi. Napauta ilmoitusta avataksesi sovelluksen.
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Time Picker Modal */}
        {timePickerMode === 'time' && (
          <View style={styles.timePickerContainer}>
            {Platform.OS === 'ios' ? (
              <View style={styles.iosTimePickerContainer}>
                <View style={styles.iosTimePickerHeader}>
                  <Pressable onPress={() => setTimePickerMode('hidden')}>
                    <Text style={styles.iosTimePickerCancel}>Peruuta</Text>
                  </Pressable>
                  <Text style={styles.iosTimePickerTitle}>Valitse aika</Text>
                  <Pressable onPress={(event) => handleTimeChange(event, selectedTime)}>
                    <Text style={styles.iosTimePickerDone}>Valmis</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={selectedTime}
                  mode="time"
                  is24Hour={true}
                  display="spinner"
                  onChange={handleTimeChange}
                />
              </View>
            ) : (
              <DateTimePicker
                testID="dateTimePicker"
                value={selectedTime}
                mode="time"
                is24Hour={true}
                onChange={handleTimeChange}
                display="default"
              />
            )}
          </View>
        )}

        {/* Preferences Section */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)}>
          <Text style={styles.sectionLabel}>{t.preferences}</Text>
          <GlassCard intensity="medium" style={styles.card}>
            <SettingRow
              icon="hand-pointer-o"
              iconColor={colors.accent}
              title={t.hapticFeedback}
              description={t.hapticDescription}
            >
              <Switch
                value={hapticsEnabled}
                onValueChange={handleHapticsToggle}
                trackColor={{ false: colors.surface, true: colors.primary }}
                thumbColor={colors.white}
              />
            </SettingRow>

            <View style={styles.divider} />

            <View style={styles.settingColumn}>
              <View style={styles.settingHeader}>
                <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}15` }]}>
                  <FontAwesome name="align-left" size={18} color={colors.primary} />
                </View>
                <Text style={styles.settingTitle}>{t.interpretationLength}</Text>
              </View>
              <View style={styles.selectionGroupFull}>
                <SelectionButton
                  label={t.short}
                  selected={interpretationLength === "short"}
                  onPress={() => handleLengthChange("short")}
                />
                <SelectionButton
                  label={t.normal}
                  selected={interpretationLength === "normal"}
                  onPress={() => handleLengthChange("normal")}
                />
                <SelectionButton
                  label={t.long}
                  selected={interpretationLength === "long"}
                  onPress={() => handleLengthChange("long")}
                />
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Data Management Section */}
        <Animated.View entering={FadeInUp.duration(400).delay(300)}>
          <Text style={styles.sectionLabel}>{t.dataManagement}</Text>
          <GlassCard intensity="medium" style={styles.card}>
            <View style={styles.dataInfo}>
              <FontAwesome name="database" size={16} color={colors.textDim} />
              <Text style={styles.dataInfoText}>
                {dreamCount} {t.dreamCount}
              </Text>
            </View>

            {/* PDF Export */}
            <Pressable
              onPress={handleExportPdf}
              disabled={isExporting}
              style={({ pressed }) => [
                styles.exportButton,
                pressed && styles.exportButtonPressed,
                isExporting && styles.exportButtonDisabled,
              ]}
            >
              <FontAwesome name="file-pdf-o" size={16} color={colors.primary} />
              <Text style={styles.exportButtonText}>
                {isExporting ? "Viedään..." : "Vie PDF-muodossa"}
              </Text>
              {!hasPremiumAccess && (
                <View style={styles.premiumBadge}>
                  <FontAwesome name="diamond" size={10} color={colors.accent} />
                </View>
              )}
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              onPress={handleClearHistory}
              style={({ pressed }) => [
                styles.dangerButton,
                pressed && styles.dangerButtonPressed,
              ]}
            >
              <FontAwesome name="trash" size={16} color="#EF4444" />
              <Text style={styles.dangerButtonText}>{t.clearHistory}</Text>
            </Pressable>
            <Text style={styles.clearDescription}>{t.clearHistoryDescription}</Text>
          </GlassCard>
        </Animated.View>

        {/* About Section */}
        <Animated.View entering={FadeInUp.duration(400).delay(400)}>
          <Text style={styles.sectionLabel}>{t.about}</Text>
          <GlassCard intensity="light" style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>{t.version}</Text>
              <Text style={styles.aboutValue}>{appVersion}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.creditsContainer}>
              <View style={styles.creditsLogos}>
                <Text style={styles.creditEmoji}>🌙</Text>
                <Text style={styles.creditEmoji}>✨</Text>
                <Text style={styles.creditEmoji}>🔮</Text>
              </View>
              <Text style={styles.creditsText}>{t.madeWith}</Text>
              <View style={styles.techBadges}>
                <View style={styles.techBadge}>
                  <Text style={styles.techBadgeText}>AI SDK 6</Text>
                </View>
                <View style={styles.techBadge}>
                  <Text style={styles.techBadgeText}>Aihio AI</Text>
                </View>
                <View style={styles.techBadge}>
                  <Text style={styles.techBadgeText}>Expo</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <Pressable
              onPress={openPrivacyPolicy}
              style={({ pressed }) => [
                styles.linkRow,
                pressed && styles.linkRowPressed,
              ]}
            >
              <FontAwesome name="shield" size={16} color={colors.textMuted} />
              <Text style={styles.linkText}>{t.privacyPolicy}</Text>
              <FontAwesome name="external-link" size={12} color={colors.textDim} />
            </Pressable>
          </GlassCard>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.duration(400).delay(500)}>
          <Text style={styles.footer}>Unitulkki © 2026</Text>
        </Animated.View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    fontFamily: typography.families.heading.bold,
    fontSize: typography.sizes.xxl + 4,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  // Selection buttons
  selectionGroup: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  selectionGroupFull: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  selectionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  selectionButtonSelected: {
    backgroundColor: `${colors.primary}33`,
    borderColor: colors.primary,
  },
  selectionButtonText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  selectionButtonTextSelected: {
    color: colors.primary,
  },
  // Setting row
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  settingDescription: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
    marginTop: 2,
  },
  settingAction: {},
  // Setting column
  settingColumn: {},
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  // Premium card
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  premiumIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  // Data management
  dataInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  // Export button
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}1A`,
    marginBottom: spacing.md,
  },
  exportButtonPressed: {
    backgroundColor: `${colors.primary}33`,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  premiumBadge: {
    backgroundColor: `${colors.accent}33`,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginLeft: spacing.xs,
  },
  dataInfoText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.error}4D`,
    backgroundColor: `${colors.error}1A`,
  },
  dangerButtonPressed: {
    backgroundColor: `${colors.error}33`,
  },
  dangerButtonText: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.error,
  },
  clearDescription: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  // About
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aboutLabel: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  aboutValue: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  creditsContainer: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  creditsLogos: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  creditEmoji: {
    fontSize: 28,
  },
  creditsText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  techBadges: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  techBadge: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  techBadgeText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
  },
  // Link row
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  linkRowPressed: {
    opacity: 0.7,
  },
  linkText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    flex: 1,
  },
  // Footer
  footer: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.md,
    opacity: 0.6,
  },
  // Time picker
  timePickerButton: {
    paddingVertical: spacing.sm,
  },
  timeDisplay: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  // Test alarm button
  testAlarmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: `${colors.accent}1A`,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
  },
  testAlarmButtonPressed: {
    backgroundColor: `${colors.accent}33`,
  },
  testAlarmText: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.accent,
  },
  alarmInfoText: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 18,
  },
  timePickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
  },
  iosTimePickerContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: 'hidden',
  },
  iosTimePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iosTimePickerCancel: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.md,
    color: colors.textDim,
  },
  iosTimePickerTitle: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
  iosTimePickerDone: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
});
