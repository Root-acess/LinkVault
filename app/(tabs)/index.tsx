import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Voice from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * IMPORTANT:
 * - If react-native-voice is not available (managed Expo without native build),
 *   this file falls back to recording audio with expo-av and sending it to AssemblyAI.
 *
 * - Replace `ASSEMBLYAI_API_KEY` with your real key if you want fallback transcription.
 */
const ASSEMBLYAI_API_KEY = 'REPLACE_WITH_ASSEMBLYAI_KEY'; // Set this for fallback transcription

export default function Dashboard() {
  const insets = useSafeAreaInsets();

  /* ---------------- state ---------------- */
  const [username, setUsername] = useState('User');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [command, setCommand] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; text: string }>>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [systemStatus, setSystemStatus] = useState<Record<string, string>>({});
  const [volume, setVolume] = useState<number>(60);
  const [brightness, setBrightness] = useState<number>(72);
  const [performance, setPerformance] = useState<number>(50);
  const [activeSlider, setActiveSlider] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [partialTranscription, setPartialTranscription] = useState<string>('');

  // 🔧 KEYBOARD FIX: track keyboard height so command bar moves above it
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  const animScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  // Detect if native Voice module is actually usable
  const voiceAvailable = !!Voice && typeof Voice.start === 'function';

  /* ---------- keyboard listeners (🔧 KEYBOARD FIX) ---------- */
  useEffect(() => {
    const onShow = (e: any) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
      // small timeout to allow layout to update before scrolling
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    };
    const onHide = () => setKeyboardHeight(0);

    const showSub = Keyboard.addListener('keyboardDidShow', onShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /* ------------- load user ------------- */
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoadingUser(true);
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const name =
            (data.user.user_metadata as any)?.username ||
            data.user.email?.split('@')[0] ||
            'User';
          setUsername(capitalize(name));
        }
      } catch (err) {
        console.warn('Failed to load user:', err);
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  /* ------------- Voice setup & cleanup ------------- */
  useEffect(() => {
    if (!voiceAvailable) return;

    const attachListeners = () => {
      Voice.onSpeechStart = onSpeechStartHandler;
      Voice.onSpeechEnd = onSpeechEndHandler;
      Voice.onSpeechResults = onSpeechResultsHandler;
      Voice.onSpeechPartialResults = onSpeechPartialResultsHandler;
      Voice.onSpeechError = onSpeechErrorHandler;
    };

    attachListeners();

    return () => {
      // Safe cleanup - only call if methods exist
      try {
        if (typeof Voice.removeAllListeners === 'function') {
          Voice.removeAllListeners();
        }
        if (typeof Voice.destroy === 'function') {
          Voice.destroy().catch(() => {});
        }
      } catch (err) {
        console.warn('Voice cleanup skipped (not native):', err);
      }
      stopPulse();
    };
  }, [voiceAvailable]);

  /* ---------- Voice handlers ---------- */
  const onSpeechStartHandler = () => {
    setIsRecording(true);
    setPartialTranscription('');
    startPulse();
  };

  const onSpeechEndHandler = () => {
    setIsRecording(false);
    stopPulse();
  };

  const onSpeechResultsHandler = (e: any) => {
    const results = e?.value || [];
    if (results.length > 0) {
      const best = results[0].trim();
      setCommand(best);
      setPartialTranscription('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      runCommand(best);
    }
    setIsRecording(false);
    stopPulse();
  };

  const onSpeechPartialResultsHandler = (e: any) => {
    const partials = e?.value || [];
    setPartialTranscription(partials[0] || '');
  };

  const onSpeechErrorHandler = (e: any) => {
    console.warn('Voice error:', e);
    setIsRecording(false);
    setPartialTranscription('');
    stopPulse();
    Alert.alert('Speech Error', e?.error?.message || 'Microphone error');
  };

  /* ---------- permissions ---------- */
  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs microphone access for voice commands.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Android permission error:', err);
        return false;
      }
    }
    // iOS handled via Info.plist
    return true;
  };

  /* ---------- Recording Controls ---------- */
  const startRecording = async () => {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Microphone access is needed.');
      return;
    }

    if (voiceAvailable) {
      try {
        setPartialTranscription('');
        await Voice.start('en-US');
        return;
      } catch (err) {
        console.warn('Native Voice start failed:', err);
      }
    }

    // Fallback to expo-av
    await startExpoRecording();
  };

  const stopRecording = async () => {
    if (voiceAvailable) {
      try {
        await Voice.stop();
        return;
      } catch (err) {
        console.warn('Native Voice stop failed:', err);
      }
    }

    await stopExpoRecordingAndTranscribe();
  };

  /* ---------- expo-av fallback ---------- */
  const startExpoRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') throw new Error('Audio permission denied');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setPartialTranscription('');
      startPulse();
    } catch (err) {
      console.warn('Expo recording start failed:', err);
      Alert.alert('Recording Error', 'Failed to start audio recording.');
      setIsRecording(false);
      stopPulse();
    }
  };

  const stopExpoRecordingAndTranscribe = async () => {
    const recording = recordingRef.current;
    if (!recording) {
      setIsRecording(false);
      stopPulse();
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      stopPulse();

      if (!uri) {
        Alert.alert('Recording Error', 'No audio was captured.');
        return;
      }

      if (!ASSEMBLYAI_API_KEY || ASSEMBLYAI_API_KEY === 'REPLACE_WITH_ASSEMBLYAI_KEY') {
        Alert.alert(
          'Audio Recorded',
          `Saved to: ${uri}\n\nNo transcription (AssemblyAI key missing). Set ASSEMBLYAI_API_KEY to enable.`
        );
        return;
      }

      // Upload to AssemblyAI
      const uploadResp = await FileSystem.uploadAsync(
        'https://api.assemblyai.com/v2/upload',
        uri,
        {
          headers: { authorization: ASSEMBLYAI_API_KEY },
          httpMethod: 'POST',
        }
      );

      const uploadBody = JSON.parse(uploadResp.body);
      const audioUrl = uploadBody?.upload_url;
      if (!audioUrl) throw new Error('No upload URL received');

      // Start transcription
      const transcriptReq = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ audio_url: audioUrl }),
      });

      const transcriptResp = await transcriptReq.json();
      if (!transcriptResp?.id) throw new Error('Failed to start transcription');

      const transcriptId = transcriptResp.id;

      // Poll for result
      let polling = true;
      let transcriptText = '';
      for (let i = 0; i < 30 && polling; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const check = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { authorization: ASSEMBLYAI_API_KEY },
        });
        const checkJson = await check.json();

        if (checkJson.status === 'completed') {
          transcriptText = checkJson.text || '';
          polling = false;
        } else if (checkJson.status === 'error') {
          polling = false;
          throw new Error(checkJson.error || 'Transcription failed');
        }
      }

      if (transcriptText) {
        setCommand((prev) => (prev ? prev + ' ' + transcriptText : transcriptText));
        runCommand(transcriptText);
      } else {
        Alert.alert('Transcription', 'No text recognized (timeout or empty).');
      }
    } catch (err) {
      console.warn('Expo transcription failed:', err);
      Alert.alert('Error', 'Failed to process audio.');
      setIsRecording(false);
      stopPulse();
    }
  };

  /* ---------- Pulse Animation ---------- */
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animScale, {
          toValue: 1.08,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animScale, {
          toValue: 1,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, {
          toValue: 0.25,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoopRef.current.start();
  };

  const stopPulse = () => {
    animScale.stopAnimation();
    pulseLoopRef.current?.stop();
    Animated.parallel([
      Animated.timing(animScale, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(pulseOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  /* ---------- Command Execution ---------- */
  const runCommand = (label: string, payload?: any) => {
    const full = payload !== undefined ? `${label} — ${payload}` : label;
    console.log('Command:', full);

    if (label.toLowerCase().includes('shutdown')) {
      setSystemStatus((s) => ({ ...s, Shutdown: 'pending' }));
      setTimeout(() => setSystemStatus((s) => ({ ...s, Shutdown: 'done' })), 2000);
      Alert.alert('Shutdown', 'System shutdown initiated (simulated).');
    } else if (label.toLowerCase().includes('restart')) {
      Alert.alert('Restart', 'System restart initiated (simulated).');
    } else if (label.toLowerCase().includes('lock')) {
      Alert.alert('Lock', 'Screen locked (simulated).');
    } else if (label.toLowerCase().includes('sleep')) {
      Alert.alert('Sleep', 'System entering sleep mode (simulated).');
    } else if (label.toLowerCase().includes('play')) {
      setIsPlaying(true);
      Alert.alert('Media', 'Playing media (simulated).');
    } else if (label.toLowerCase().includes('pause')) {
      setIsPlaying(false);
      Alert.alert('Media', 'Media paused (simulated).');
    } else if (label.toLowerCase().includes('screenshot')) {
      Alert.alert('Screenshot', 'Screenshot captured (simulated).');
    } else if (label.toLowerCase().includes('volume') || label.toLowerCase().includes('volume to')) {
      const val = Number(label.match(/\d+/)?.[0] ?? payload ?? volume);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        setVolume(val);
        Alert.alert('Volume', `Set to ${val}%`);
      }
    } else {
      Alert.alert('Command', `Executed: ${full} (simulated)`);
    }
  };

  const handleSend = () => {
    if (!command.trim()) return;
    runCommand(command.trim());
    setCommand('');
    Keyboard.dismiss();
  };

  const openSliderFor = (type: string) => {
    setActiveSlider((prev) => (prev === type ? null : type));
  };

  /* ---------- Render ---------- */
  return (
    <LinearGradient colors={['#F6FAFF', '#EEF4FF']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: 220 }]}
        >
          {/* HEADER */}
          <Text style={styles.heading}>
            Welcome back, {isLoadingUser ? '...' : username} 👋
          </Text>
          <Text style={styles.subheading}>Control your system quickly and smartly</Text>

          {/* ROW 1 */}
          <View style={styles.row}>
            <Card title="Recent Commands">
              {['Open Chrome', 'Shutdown', 'Play Music'].map((item) => (
                <List key={item} icon="flash-outline" label={item} onPress={() => runCommand(item)} />
              ))}
            </Card>

            <Card title="System Controls">
              <Grid>
                <SoftTile icon="power" label="Shutdown" color="#EF4444" onPress={() => runCommand('Shutdown')} />
                <SoftTile icon="refresh" label="Restart" color="#F97316" onPress={() => runCommand('Restart')} />
                <SoftTile icon="lock-closed" label="Lock" color="#2563EB" onPress={() => runCommand('Lock')} />
                <SoftTile icon="moon" label="Sleep" color="#6366F1" onPress={() => runCommand('Sleep')} />
              </Grid>
            </Card>
          </View>

          {/* QUICK CONTROLS */}
          <Card title="Quick Controls">
            <QuickControl
              icon="volume-high"
              label={`Volume ${Math.round(volume)}%`}
              color="#2563EB"
              onPress={() => openSliderFor('volume')}
              rightElement={<Text style={styles.smallValue}>{Math.round(volume)}</Text>}
            />
            <QuickControl
              icon="sunny"
              label={`Brightness ${Math.round(brightness)}%`}
              color="#F59E0B"
              onPress={() => openSliderFor('brightness')}
              rightElement={<Text style={styles.smallValue}>{Math.round(brightness)}</Text>}
            />
            <QuickControl
              icon="speedometer"
              label={`Performance ${Math.round(performance)}%`}
              color="#16A34A"
              onPress={() => openSliderFor('performance')}
              rightElement={<Text style={styles.smallValue}>{Math.round(performance)}</Text>}
            />

            {activeSlider && (
              <View style={styles.sliderPanel}>
                <Text style={styles.sliderLabel}>
                  {activeSlider.charAt(0).toUpperCase() + activeSlider.slice(1)}
                </Text>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={
                    activeSlider === 'volume'
                      ? volume
                      : activeSlider === 'brightness'
                      ? brightness
                      : performance
                  }
                  onValueChange={(val) => {
                    if (activeSlider === 'volume') setVolume(val);
                    else if (activeSlider === 'brightness') setBrightness(val);
                    else setPerformance(val);
                  }}
                />
                <View style={styles.sliderRow}>
                  <TouchableOpacity
                    style={styles.smallBtn}
                    onPress={() => {
                      if (activeSlider === 'volume') setVolume(60);
                      if (activeSlider === 'brightness') setBrightness(72);
                      if (activeSlider === 'performance') setPerformance(50);
                    }}
                  >
                    <Text style={styles.smallBtnText}>Reset</Text>
                  </TouchableOpacity>

                  <View style={{ width: 8 }} />

                  <TouchableOpacity
                    style={[styles.smallBtn, styles.primarySmallBtn]}
                    onPress={() => {
                      const value =
                        activeSlider === 'volume'
                          ? volume
                          : activeSlider === 'brightness'
                          ? brightness
                          : performance;
                      runCommand(activeSlider.charAt(0).toUpperCase() + activeSlider.slice(1), value);
                      setActiveSlider(null);
                    }}
                  >
                    <Text style={[styles.smallBtnText, { color: '#fff' }]}>Apply</Text>
                  </TouchableOpacity>

                  <View style={{ width: 8 }} />

                  <TouchableOpacity style={styles.smallBtn} onPress={() => setActiveSlider(null)}>
                    <Text style={styles.smallBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card>

          {/* ROW 2 */}
          <View style={styles.row}>
            <Card title="Open Applications">
              {['Open Chrome', 'Open VS Code', 'Open Files'].map((item) => (
                <List key={item} icon="apps-outline" label={item} onPress={() => runCommand(item)} />
              ))}
            </Card>

            <Card title="File & Media Control">
              <Grid>
                <SoftTile
                  icon={isPlaying ? 'play-skip-back' : 'musical-note'}
                  label={isPlaying ? 'Playing' : 'Play Music'}
                  color="#22C55E"
                  onPress={() => runCommand('Play Music')}
                />
                <SoftTile icon="pause" label="Pause" color="#0EA5E9" onPress={() => runCommand('Pause')} />
                <SoftTile
                  icon="camera"
                  label="Screenshot"
                  color="#8B5CF6"
                  onPress={() => runCommand('Screenshot')}
                  full
                />
              </Grid>
            </Card>
          </View>

          {/* Messages */}
          {messages.length > 0 && (
            <View style={{ marginTop: 16 }}>
              {messages.map((m) => (
                <View key={m.id} style={styles.chatBubble}>
                  <Text style={styles.chatText}>{m.text}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Command Bar */}
        <View style={[styles.commandBar, { left: 16, right: 16, bottom: insets.bottom + keyboardHeight + 12 }]}>
          <TouchableOpacity
            onPress={() => Alert.alert('Attach', 'Attach feature coming soon')}
            style={{ marginRight: 8 }}
          >
            <Ionicons name="add" size={20} color="#64748B" />
          </TouchableOpacity>

          <View style={{ flex: 1, marginRight: 8 }}>
            <TextInput
              placeholder="Ask or type a command..."
              value={command}
              onChangeText={setCommand}
              style={styles.commandInput}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
            />
            {isRecording && partialTranscription && (
              <Text style={styles.partialText}>{partialTranscription}</Text>
            )}
          </View>

          <View style={{ alignItems: 'center', marginRight: 8 }}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  opacity: pulseOpacity,
                  transform: [
                    {
                      scale: animScale.interpolate({
                        inputRange: [1, 1.08],
                        outputRange: [1.0, 1.25],
                      }),
                    },
                  ],
                },
              ]}
              pointerEvents="none"
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => (isRecording ? stopRecording() : startRecording())}
              style={[styles.micBtn, isRecording && styles.micBtnActive]}
              accessibilityLabel={isRecording ? 'Stop recording' : 'Start voice command'}
            >
              <Animated.View style={{ transform: [{ scale: animScale }] }}>
                <Ionicons
                  name={isRecording ? 'mic' : 'mic-outline'}
                  size={18}
                  color={isRecording ? '#fff' : '#2563EB'}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.send} onPress={handleSend}>
            <Ionicons name="paper-plane" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* ---------- COMPONENTS ---------- */
const Card = ({ title, children }: any) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const List = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.listItem} onPress={() => onPress(label)}>
    <Ionicons name={icon} size={18} color="#475569" />
    <Text style={styles.listText}>{label}</Text>
    <View style={styles.statusDot} />
  </TouchableOpacity>
);

const Grid = ({ children }: any) => <View style={styles.grid}>{children}</View>;

const SoftTile = ({ icon, label, onPress, full, color = '#2563EB' }: any) => (
  <TouchableOpacity
    onPress={() => onPress(label)}
    style={[styles.tile, full && styles.fullTile, { backgroundColor: color + '15' }]}
    activeOpacity={0.85}
  >
    <Ionicons name={icon} size={26} color={color} />
    <Text style={styles.tileText}>{label}</Text>
  </TouchableOpacity>
);

const QuickControl = ({ icon, label, onPress, color = '#2563EB', rightElement }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.quickControl} activeOpacity={0.85}>
    <View style={[styles.quickIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.quickText}>{label}</Text>
    {rightElement || <Ionicons name="chevron-forward" size={18} color="#94A3B8" />}
  </TouchableOpacity>
);

/* ---------- UTILS ---------- */
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/* ---------- STYLES (unchanged, just here for completeness) ---------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 60 },
  heading: { fontSize: 30, fontWeight: '700', color: '#1E293B' },
  subheading: { fontSize: 16, color: '#64748B', marginBottom: 24 },
  row: { flexDirection: 'row', gap: 14, marginBottom: 18 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6EDFF',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1E293B' },
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  listText: { fontSize: 15, color: '#475569', flex: 1 },
  statusDot: { width: 8, height: 8, backgroundColor: '#22C55E', borderRadius: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: {
    width: '48%',
    height: 96,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  fullTile: { width: '100%' },
  tileText: { marginTop: 8, fontSize: 13, fontWeight: '600', color: '#334155' },
  quickControl: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFF',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5EDFF',
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' },
  smallValue: { color: '#475569', fontWeight: '700', marginRight: 6 },
  sliderPanel: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FBFDFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  sliderLabel: { fontSize: 14, fontWeight: '700', color: '#102A43', marginBottom: 6 },
  sliderRow: { flexDirection: 'row', marginTop: 6, alignItems: 'center' },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6EDFF',
    backgroundColor: '#fff',
  },
  primarySmallBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  smallBtnText: { fontSize: 13, color: '#334155', fontWeight: '600' },
  commandBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E6EDFF',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 6,
  },
  commandInput: { fontSize: 15, paddingVertical: 6 },
  partialText: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E6EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  micBtnActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 80,
    backgroundColor: '#EF4444',
    opacity: 0,
    zIndex: -1,
    top: -18,
    left: -18,
  },
  send: { backgroundColor: '#2563EB', padding: 10, borderRadius: 999, marginLeft: 4 },
  chatBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEF4FF',
  },
  chatText: { color: '#0F172A', fontSize: 14 },
});
