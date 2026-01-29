/**
 * Voice Input for Dreams
 * 
 * Premium feature: Record dream descriptions using voice
 * Uses expo-av for recording and sends to Whisper API for transcription
 */

import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { CONFIG } from "@/lib/config";

// Recording state
export type RecordingState = "idle" | "recording" | "processing" | "error";

// Recording result
export type RecordingResult = {
  transcript: string;
  duration: number;
  confidence?: number;
};

// Recording settings optimized for speech
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: ".m4a",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: ".m4a",
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

// Class to manage voice recording
class VoiceRecorder {
  private recording: Audio.Recording | null = null;
  private permissionGranted: boolean = false;

  /**
   * Request microphone permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      this.permissionGranted = status === "granted";
      return this.permissionGranted;
    } catch (error) {
      console.error("Error requesting audio permission:", error);
      return false;
    }
  }

  /**
   * Check if permission is granted
   */
  async hasPermission(): Promise<boolean> {
    const { status } = await Audio.getPermissionsAsync();
    this.permissionGranted = status === "granted";
    return this.permissionGranted;
  }

  /**
   * Start recording
   */
  async startRecording(): Promise<void> {
    try {
      // Check permission
      if (!this.permissionGranted) {
        const granted = await this.requestPermission();
        if (!granted) {
          throw new Error("Mikrofonin käyttölupa vaaditaan");
        }
      }

      // Stop any existing recording
      if (this.recording) {
        await this.stopRecording();
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
      this.recording = recording;
    } catch (error) {
      console.error("Error starting recording:", error);
      throw new Error("Nauhoituksen aloittaminen epäonnistui");
    }
  }

  /**
   * Stop recording and get the audio file URI
   */
  async stopRecording(): Promise<{ uri: string; duration: number }> {
    if (!this.recording) {
      throw new Error("Ei aktiivista nauhoitusta");
    }

    try {
      await this.recording.stopAndUnloadAsync();
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();
      
      if (!uri) {
        throw new Error("Nauhoituksen tallentaminen epäonnistui");
      }

      const duration = status.durationMillis || 0;
      this.recording = null;

      return { uri, duration };
    } catch (error) {
      console.error("Error stopping recording:", error);
      this.recording = null;
      throw new Error("Nauhoituksen lopettaminen epäonnistui");
    }
  }

  /**
   * Cancel recording without saving
   */
  async cancelRecording(): Promise<void> {
    if (!this.recording) return;

    try {
      await this.recording.stopAndUnloadAsync();
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Delete the file if it exists
      const uri = this.recording.getURI();
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      console.error("Error canceling recording:", error);
    } finally {
      this.recording = null;
    }
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.recording !== null;
  }
}

// Singleton instance
export const voiceRecorder = new VoiceRecorder();

/**
 * Transcribe audio file using Whisper API
 * Note: In production, this should go through your backend to protect API keys
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  try {
    // Read the audio file
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error("Äänitiedostoa ei löytynyt");
    }

    // For now, we'll use a mock transcription
    // In production, you would:
    // 1. Upload to your backend
    // 2. Backend calls Whisper API
    // 3. Return transcription

    // Upload to our backend API
    const formData = new FormData();

    if (Platform.OS === "web") {
      const audioResponse = await fetch(audioUri);
      const blob = await audioResponse.blob();
      formData.append("file", blob, "recording.m4a");
    } else {
      formData.append("file", {
        uri: audioUri,
        name: "recording.m4a",
        type: "audio/m4a",
      } as any);
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}/api/transcribe`, {
      method: "POST",
      body: formData,
      headers: {
        // "Content-Type": "multipart/form-data", // Do NOT set this manually when using FormData in fetch, browser/engine sets boundary
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Transkriptio epäonnistui");
    }

    const data = await response.json();
    return data.text;

  } catch (error) {
    console.error("Transcription error:", error);
    
    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
       throw new Error("OpenAI-avain puuttuu");
    }
    
    throw new Error("Puheentunnistus epäonnistui");
  }
}

/**
 * Record and transcribe in one operation
 */
export async function recordAndTranscribe(
  onStateChange?: (state: RecordingState) => void
): Promise<RecordingResult> {
  try {
    // 1. Start recording
    onStateChange?.("recording");
    await voiceRecorder.startRecording();
    
    // Wait for a minimum duration or until stopped? 
    // This helper function assumes the caller handles the stopping
    // OR we could return a "stop" function.
    
    // Actually, this function signature suggests "do it all".
    // But usually we need user interaction to stop.
    // So let's change this to "start" and return a "stopAndTranscribe" function.
    
    throw new Error("Use startRecording() and stopRecording() + transcribeAudio() separately for UI control");
    
  } catch (error) {
    onStateChange?.("error");
    throw error;
  }
}

/**
 * Get recording duration in formatted string (mm:ss)
 */
export function formatRecordingDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Maximum recording duration (2 minutes)
 */
export const MAX_RECORDING_DURATION = 2 * 60 * 1000;

/**
 * Check if voice input is supported
 */
export async function isVoiceInputSupported(): Promise<boolean> {
  try {
    const { status } = await Audio.getPermissionsAsync();
    return status === "granted" || status === "undetermined";
  } catch {
    return false;
  }
}
