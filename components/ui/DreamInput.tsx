import { useState, useRef } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  Pressable,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "@/lib/design-tokens";

type DreamInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  disabled?: boolean;
  maxHeight?: number;
  minHeight?: number;
  maxLength?: number;
  className?: string;
  onVoicePress?: () => void;
  isRecording?: boolean;
  isTranscribing?: boolean;
};

export function DreamInput({
  value,
  onChangeText,
  placeholder = "Kuvaile unesi...",
  onSubmit,
  disabled = false,
  maxHeight = 150,
  minHeight = 56,
  maxLength,
  onVoicePress,
  isRecording = false,
  isTranscribing = false,
}: DreamInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(minHeight);
  const inputRef = useRef<TextInput>(null);

  const handleContentSizeChange = (
    e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
  ) => {
    const newHeight = Math.min(
      Math.max(e.nativeEvent.contentSize.height + 24, minHeight),
      maxHeight
    );
    setInputHeight(newHeight);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          isRecording && styles.containerRecording,
        ]}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={isRecording ? "Kuunnellaan..." : placeholder}
          placeholderTextColor={colors.textDim}
          multiline
          textAlignVertical="top"
          editable={!disabled && !isRecording && !isTranscribing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onContentSizeChange={handleContentSizeChange}
          onSubmitEditing={onSubmit}
          blurOnSubmit={false}
          maxLength={maxLength}
          style={[
            styles.input,
            {
              height: inputHeight,
              opacity: disabled || isTranscribing ? 0.5 : 1,
            },
          ]}
        />
        
        {/* Voice Input Button */}
        {onVoicePress && (
          <Pressable
            onPress={onVoicePress}
            disabled={disabled || isTranscribing}
            style={[
              styles.micButton,
              isRecording && styles.micButtonRecording,
            ]}
          >
            {isTranscribing ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <FontAwesome
                name={isRecording ? "stop" : "microphone"}
                size={16}
                color={isRecording ? colors.white : colors.textDim}
              />
            )}
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(26, 10, 46, 0.6)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xs,
    position: "relative",
  },
  containerFocused: {
    borderColor: colors.primary,
    backgroundColor: "rgba(26, 10, 46, 0.8)",
  },
  containerRecording: {
    borderColor: colors.error,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  input: {
    fontFamily: typography.families.body.regular,
    fontSize: typography.sizes.md,
    lineHeight: 24,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingRight: 48, // Make room for mic button
  },
  micButton: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonRecording: {
    backgroundColor: colors.error,
  },
});

export default DreamInput;
