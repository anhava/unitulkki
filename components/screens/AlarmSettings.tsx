import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
} from "react-native";
import {
  createAlarm,
  getAlarms,
  updateAlarm,
  deleteAlarm,
  getNextAlarm,
  hasActiveAlarms,
  type Alarm,
} from "@/lib/alarm";
import DateTimePicker from "@react-native-community/datetimepicker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import haptics, { selectionChange } from "@/lib/haptics";
import { useToast } from "@/hooks/useToast";

// Days of week (Su=0, Mo=1, etc.)
const DAYS_OF_WEEK = [
  { id: 0, label: "Su", labelFi: "Ma" },
  { id: 1, label: "Ma", labelFi: "Ti" },
  { id: 2, label: "Ti", labelFi: "Ke" },
  { id: 3, label: "Ke", labelFi: "To" },
  { id: 4, label: "To", labelFi: "Pe" },
  { id: 5, label: "Pe", labelFi: "La" },
  { id: 6, label: "La", labelFi: "Su" },
];

interface AlarmSettingsProps {
  onTest: () => void;
}

export function AlarmSettings({ onTest }: AlarmSettingsProps) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [nextAlarm, setNextAlarm] = useState<Alarm | null>(null);
  const { showSuccess, showError } = useToast();

  const loadAlarms = useCallback(async () => {
    try {
      const loadedAlarms = await getAlarms();
      setAlarms(loadedAlarms);
      const next = await getNextAlarm();
      setNextAlarm(next);
    } catch (error) {
      console.error("Error loading alarms:", error);
    }
  }, []);

  useEffect(() => {
    loadAlarms();
  }, [loadAlarms]);

  const formatAlarmTime = (hour: number, minute: number): string => {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  };

  const formatDays = (days: number[]): string => {
    if (days.length === 0) return "Kerran";
    if (days.length === 7) return "Joka päivä";
    
    const dayLabels = days.map((day) => {
      const dayObj = DAYS_OF_WEEK.find((d) => d.id === day);
      return dayObj?.labelFi || dayObj?.label || "";
    });
    
    if (days.length <= 3) {
      return dayLabels.join(", ");
    }
    
    return `${dayLabels.slice(0, 3).join(", ")}...`;
  };

  const handleToggleAlarm = async (alarm: Alarm) => {
    try {
      haptics.selection();
      const updated = await updateAlarm(alarm.id, { enabled: !alarm.enabled });
      
      if (updated) {
        await loadAlarms();
        showSuccess(updated.enabled ? "Herätys päällä" : "Herätys pois päältä");
      } else {
        showError("Virhe heräyksen muokkauksessa");
      }
    } catch (error) {
      console.error("Error toggling alarm:", error);
      showError("Virhe");
    }
  };

  const handleDeleteAlarm = async (alarmId: string) => {
    try {
      haptics.warning();
      const success = await deleteAlarm(alarmId);
      
      if (success) {
        await loadAlarms();
        showSuccess("Herätys poistettu");
      } else {
        showError("Virhe heräyksen poistamisessa");
      }
    } catch (error) {
      console.error("Error deleting alarm:", error);
      showError("Virhe");
    }
  };

  return (
    <View style={styles.container}>
      {/* Next Alarm Info */}
      {nextAlarm && nextAlarm.enabled ? (
        <View style={styles.nextAlarmCard}>
          <View style={styles.nextAlarmHeader}>
            <FontAwesome name="clock-o" size={16} color={colors.primary} />
            <Text style={styles.nextAlarmTitle}>Seuraava herätys</Text>
          </View>
          <View style={styles.nextAlarmContent}>
            <Text style={styles.nextAlarmTime}>
              {formatAlarmTime(nextAlarm.hour, nextAlarm.minute)}
            </Text>
            <Text style={styles.nextAlarmDays}>
              {formatDays(nextAlarm.days)}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.noAlarmCard}>
          <FontAwesome name="clock-o" size={16} color={colors.textDim} />
          <Text style={styles.noAlarmText}>Ei aktiivisia herätyksiä</Text>
        </View>
      )}

      {/* Quick Test Button */}
      <Pressable
        onPress={onTest}
        style={({ pressed }) => [
          styles.testButton,
          pressed && styles.testButtonPressed,
        ]}
      >
        <FontAwesome name="bell" size={16} color={colors.primary} />
        <Text style={styles.testButtonText}>Testaa herätys</Text>
      </Pressable>

      {/* Alarm List */}
      {alarms.length > 0 && (
        <View style={styles.alarmsContainer}>
          {alarms.map((alarm) => (
            <View key={alarm.id} style={styles.alarmItem}>
              <View style={styles.alarmInfo}>
                <Text style={[
                  styles.alarmTime,
                  !alarm.enabled && styles.alarmTimeDisabled,
                ]}>
                  {formatAlarmTime(alarm.hour, alarm.minute)}
                </Text>
                <Text style={[
                  styles.alarmDays,
                  !alarm.enabled && styles.alarmDaysDisabled,
                ]}>
                  {formatDays(alarm.days)}
                </Text>
                {alarm.label && (
                  <Text style={[
                    styles.alarmLabel,
                    !alarm.enabled && styles.alarmLabelDisabled,
                  ]}>
                    {alarm.label}
                  </Text>
                )}
              </View>
              <View style={styles.alarmActions}>
                <Pressable onPress={() => handleToggleAlarm(alarm)}>
                  <FontAwesome
                    name={alarm.enabled ? "toggle-on" : "toggle-off"}
                    size={32}
                    color={alarm.enabled ? colors.primary : colors.textDim}
                  />
                </Pressable>
                <Pressable onPress={() => handleDeleteAlarm(alarm.id)}>
                  <FontAwesome name="trash" size={16} color={colors.error} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nextAlarmCard: {
    backgroundColor: `${colors.primary}15`,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  nextAlarmHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  nextAlarmTitle: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  nextAlarmContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  nextAlarmTime: {
    fontFamily: typography.families.heading.bold,
    fontSize: typography.sizes.xxxl,
    color: colors.primary,
  },
  nextAlarmDays: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  noAlarmCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  noAlarmText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: `${colors.primary}1A`,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  testButtonPressed: {
    backgroundColor: `${colors.primary}33`,
  },
  testButtonText: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  alarmsContainer: {
    gap: spacing.sm,
  },
  alarmItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTime: {
    fontFamily: typography.families.heading.bold,
    fontSize: typography.sizes.xxl,
    color: colors.text,
  },
  alarmTimeDisabled: {
    color: colors.textDim,
  },
  alarmDays: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  alarmDaysDisabled: {
    color: colors.textDim,
  },
  alarmLabel: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.xs,
    color: colors.textDim,
    marginTop: spacing.xs,
  },
  alarmLabelDisabled: {
    color: colors.textDim,
  },
  alarmActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
});