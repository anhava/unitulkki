import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";
import { createAlarm, type Alarm } from "@/lib/alarm";
import haptics from "@/lib/haptics";
import { useToast } from "@/hooks/useToast";

interface AlarmSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onAlarmCreated: () => void;
}

// Days of week
const DAYS_OF_WEEK = [
  { id: 0, label: "Su", labelFi: "Ma" },
  { id: 1, label: "Ma", labelFi: "Ti" },
  { id: 2, label: "Ti", labelFi: "Ke" },
  { id: 3, label: "Ke", labelFi: "To" },
  { id: 4, label: "To", labelFi: "Pe" },
  { id: 5, label: "Pe", labelFi: "La" },
  { id: 6, label: "La", labelFi: "Su" },
];

export function AlarmSetupModal({ visible, onClose, onAlarmCreated }: AlarmSetupModalProps) {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [label, setLabel] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'android');
  const { showSuccess, showError } = useToast();

  const handleTimeChange = useCallback((event: any, date?: Date) => {
    if (event.type === 'set' && date) {
      setSelectedTime(date);
    }
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
  }, []);

  const toggleDay = useCallback((dayId: number) => {
    haptics.selection();
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        return prev.filter((d) => d !== dayId);
      }
      return [...prev, dayId];
    });
  }, []);

  const handleCreateAlarm = useCallback(async () => {
    try {
      haptics.light();
      
      if (selectedDays.length === 0) {
        showError("Valitse vähintään yksi päivä");
        return;
      }

      const newAlarm: Omit<Alarm, 'id'> = {
        hour: selectedTime.getHours(),
        minute: selectedTime.getMinutes(),
        days: selectedDays,
        enabled: true,
        label: label || "Herätys",
        sound: "default",
        vibration: true,
      };

      const created = await createAlarm(newAlarm);
      
      if (created) {
        showSuccess("Herätys luotu!");
        onAlarmCreated();
        onClose();
        
        // Reset form
        setSelectedTime(new Date());
        setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
        setLabel("");
      } else {
        showError("Virhe heräyksen luonnissa");
      }
    } catch (error) {
      console.error("Error creating alarm:", error);
      showError("Virhe");
    }
  }, [selectedTime, selectedDays, label, onAlarmCreated, onClose, showSuccess, showError]);

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Text style={styles.cancelButton}>Peruuta</Text>
          </Pressable>
          <Text style={styles.title}>Uusi herätys</Text>
          <Pressable onPress={handleCreateAlarm}>
            <Text style={styles.saveButton}>Tallenna</Text>
          </Pressable>
        </View>

        {Platform.OS === 'ios' ? (
          <ScrollView style={styles.content}>
            {/* Time Picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aseta aika</Text>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={true}
                onChange={handleTimeChange}
                display="spinner"
                style={{ height: 150 }}
                textColor={colors.text}
              />
            </View>

            {/* Days Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Päivät</Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map((day) => (
                  <Pressable
                    key={day.id}
                    onPress={() => toggleDay(day.id)}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day.id) && styles.dayButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selectedDays.includes(day.id) && styles.dayTextSelected,
                      ]}
                    >
                      {day.labelFi}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Label */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nimi</Text>
              <Pressable
                style={styles.labelInput}
                onPress={() => {
                  haptics.selection();
                  // TODO: Add label input modal
                }}
              >
                <Text style={styles.labelText}>{label || "Herätys"}</Text>
                <FontAwesome name="pencil" size={16} color={colors.textDim} />
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          <>
            {/* Android Time Picker */}
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={true}
                onChange={handleTimeChange}
                display="default"
              />
            )}

            {/* Days Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Päivät</Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map((day) => (
                  <Pressable
                    key={day.id}
                    onPress={() => toggleDay(day.id)}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day.id) && styles.dayButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selectedDays.includes(day.id) && styles.dayTextSelected,
                      ]}
                    >
                      {day.labelFi}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Label */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nimi</Text>
              <Pressable
                style={styles.labelInput}
                onPress={() => {
                  haptics.selection();
                  // TODO: Add label input modal
                }}
              >
                <Text style={styles.labelText}>{label || "Herätys"}</Text>
                <FontAwesome name="pencil" size={16} color={colors.textDim} />
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelButton: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  title: {
    fontFamily: typography.families.heading.semiBold,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
  saveButton: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontFamily: typography.families.body.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  dayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  dayTextSelected: {
    color: colors.white,
  },
  labelInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  labelText: {
    fontFamily: typography.families.body.medium,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
});