import { Audio } from 'expo-av';
import { useRef, useState } from 'react';

export function useVoiceAssistant(onResult: (text: string) => void) {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [listening, setListening] = useState(false);

  const startListening = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    await recording.startAsync();

    recordingRef.current = recording;
    setListening(true);
  };

  const stopListening = async () => {
    if (!recordingRef.current) return;

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;
    setListening(false);

    if (uri) {
      // 👉 Send to your STT API here
      onResult('example recognized text');
    }
  };

  return {
    listening,
    startListening,
    stopListening,
  };
}
