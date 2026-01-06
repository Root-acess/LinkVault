import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PairingPayload = {
  type: 'linkvault_pair';
  version: number;
  token: string;
};

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const processingRef = useRef(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const handleScan = async ({ data }: { data: string }) => {
    if (processingRef.current) return;

    processingRef.current = true;
    setScanned(true);

    try {
      const payload: PairingPayload = JSON.parse(data);

      if (
        payload.type !== 'linkvault_pair' ||
        payload.version !== 1 ||
        !payload.token
      ) {
        throw new Error('Invalid QR code');
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // 🔎 Fetch pairing by token ONLY (do not filter yet)
      const { data: pairing, error } = await supabase
        .from('device_pairings')
        .select('*')
        .eq('token', payload.token)
        .single();

      if (error || !pairing) {
        throw new Error('Pairing request not found');
      }

      if (pairing.status !== 'pending') {
        throw new Error('Pairing request already used or expired');
      }

      if (pairing.user_id !== user.id) {
        throw new Error('This desktop belongs to another account');
      }

      const { error: approveError } = await supabase
        .from('device_pairings')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('token', payload.token);

      if (approveError) throw new Error('Approval failed');

      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});

      Alert.alert(
        'Desktop Connected',
        'Your desktop is now linked to LinkVault.',
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      ).catch(() => {});

      Alert.alert('Connection Failed', err.message || 'Try again');
      setScanned(false);
      processingRef.current = false;
    }
  };

  if (!permission?.granted) {
    return (
      <LinearGradient colors={['#F6FAFF', '#EEF4FF']} style={styles.center}>
        <Ionicons name="camera-outline" size={48} color="#64748B" />
        <Text style={styles.permissionText}>
          Camera access is required to scan the desktop QR code.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={scanned ? undefined : handleScan}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      <LinearGradient
        colors={['rgba(15,23,42,0.6)', 'rgba(15,23,42,0.9)']}
        style={[styles.overlay, { paddingBottom: insets.bottom + 40 }]}
      >
        <Text style={styles.title}>Connect Desktop</Text>
        <Text style={styles.subtitle}>
          Scan the QR code shown on your LinkVault desktop app
        </Text>

        <View style={styles.frame}>
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />
        </View>

        {scanned && (
          <Text style={styles.processingText}>
            Establishing secure connection…
          </Text>
        )}

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={16} color="#fff" />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

/* ---------- Helpers & Styles (unchanged) ---------- */

const Corner = ({ pos }: any) => {
  const map: any = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  };
  return <View style={[styles.corner, map[pos]]} />;
};

const FRAME_SIZE = 260;

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 14, color: '#CBD5E1', marginBottom: 28 },
  frame: { width: FRAME_SIZE, height: FRAME_SIZE },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderWidth: 4,
    borderColor: '#22C55E',
  },
  processingText: { marginTop: 18, color: '#E5E7EB' },
  cancelBtn: {
    marginTop: 28,
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    padding: 10,
    borderRadius: 999,
  },
  cancelText: { color: '#fff', fontWeight: '700', marginLeft: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  permissionText: { marginTop: 12, color: '#475569' },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 999,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});
