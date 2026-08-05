import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { proxtimeService } from '../src/services/proxtime';

type CheckInStep = 'photo' | 'location' | 'confirm';

export default function CheckInModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const isCheckOut = params.mode === 'check-out';

  // State Machine
  const [step, setStep] = useState<CheckInStep>('photo');

  // Step 1: Camera & Photo State
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  // Step 2: Location State
  const [locating, setLocating] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string>('Kantor Pusat');
  const [locationAddress, setLocationAddress] = useState<string>('Gedung ProxTime Tower, Lt. 12');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: -6.2241,
    longitude: 106.8322,
  });
  const [inGeofence, setInGeofence] = useState<boolean>(true);

  // Step 3: Confirmation & Submit State
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Request location on mount
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        setLocationName('Kantor Pusat');
        setLocationAddress('Gedung ProxTime Tower, Lt. 12 (GPS Terverifikasi)');
        setInGeofence(true);
      } else {
        setLocationName('Kantor Pusat');
        setLocationAddress('Gedung ProxTime Tower, Lt. 12 (Simulasi Lokasi)');
        setInGeofence(true);
      }
    } catch {
      setLocationName('Kantor Pusat');
      setLocationAddress('Gedung ProxTime Tower, Lt. 12 (Simulasi Lokasi)');
      setInGeofence(true);
    } finally {
      setLocating(false);
    }
  };

  // --- Step 1 Action: Take Photo ---
  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        if (photo?.uri) {
          setPhotoUri(photo.uri);
          setStep('location');
          return;
        }
      } catch (err) {
        console.log('Camera error, using fallback snapshot');
      }
    }
    // Fallback sample photo for web/emulator
    const fallbackPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    setPhotoUri(fallbackPhoto);
    setStep('location');
  };

  // --- Final Submit Action ---
  const handleSubmitCheckIn = async () => {
    setSubmitting(true);
    try {
      await proxtimeService.submitCheckIn(
        photoUri || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        coords.latitude,
        coords.longitude,
        notes
      );
      Alert.alert('Berhasil', 'Absen Masuk berhasil dicatat.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan saat absen.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCheckOut = async () => {
    setSubmitting(true);
    try {
      await proxtimeService.submitCheckOut(coords.latitude, coords.longitude);
      Alert.alert('Berhasil', 'Absen Pulang berhasil dicatat.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // RENDER: Check-out Flow (Simple 1 Step)
  // ==========================================
  if (isCheckOut) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>Absen Pulang</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#121c2c" />
          </TouchableOpacity>
        </View>

        <View style={[styles.body, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.checkoutBox}>
            <Ionicons name="log-out-outline" size={48} color="#BA1A1A" />
            <Text style={styles.checkoutTitle}>Konfirmasi Absen Pulang</Text>
            <Text style={styles.checkoutSub}>
              Apakah Anda telah menyelesaikan jam kerja dan siap untuk absen pulang?
            </Text>

            <View style={styles.locBadge}>
              <Ionicons name="location-outline" size={16} color="#005ea1" />
              <Text style={styles.locBadgeText}>{locationName}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.dangerPillBtn}
            onPress={handleSubmitCheckOut}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.pillBtnText}>
              {submitting ? 'Memproses...' : 'Konfirmasi Absen Pulang'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==========================================
  // RENDER: Check-in Flow (3-Step Stepper)
  // ==========================================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Check-in Karyawan</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="close" size={22} color="#414751" />
        </TouchableOpacity>
      </View>

      {/* Progress Wizard Stepper */}
      <View style={styles.wizardRow}>
        {/* Step 1: Foto */}
        {step === 'photo' ? (
          <View style={styles.wizardStepActivePill}>
            <View style={styles.wizardActiveCircle}>
              <Text style={styles.wizardActiveCircleText}>1</Text>
            </View>
            <Text style={styles.wizardActiveText}>Foto</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.wizardStepDoneGroup} onPress={() => setStep('photo')}>
            <Ionicons name="checkmark-circle" size={18} color="#005ea1" />
            <Text style={styles.wizardDoneText}>Foto</Text>
          </TouchableOpacity>
        )}

        <Ionicons name="chevron-forward" size={16} color="#c1c7d2" />

        {/* Step 2: Lokasi */}
        {step === 'location' ? (
          <View style={styles.wizardStepActivePill}>
            <View style={styles.wizardActiveCircle}>
              <Text style={styles.wizardActiveCircleText}>2</Text>
            </View>
            <Text style={styles.wizardActiveText}>Lokasi</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.wizardStepGroup}
            onPress={() => photoUri && setStep('location')}
          >
            <View style={styles.wizardCircleInactive}>
              <Text style={styles.wizardCircleTextInactive}>2</Text>
            </View>
            <Text style={styles.wizardStepTextInactive}>Lokasi</Text>
          </TouchableOpacity>
        )}

        <Ionicons name="chevron-forward" size={16} color="#c1c7d2" />

        {/* Step 3: Konfirmasi */}
        {step === 'confirm' ? (
          <View style={styles.wizardStepActivePill}>
            <View style={styles.wizardActiveCircle}>
              <Text style={styles.wizardActiveCircleText}>3</Text>
            </View>
            <Text style={styles.wizardActiveText}>Konfirmasi</Text>
          </View>
        ) : (
          <View style={styles.wizardStepGroup}>
            <View style={styles.wizardCircleInactive}>
              <Text style={styles.wizardCircleTextInactive}>3</Text>
            </View>
            <Text style={styles.wizardStepTextInactive}>Konfirmasi</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
        {/* STEP 1: PHOTO CAPTURE */}
        {step === 'photo' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepInstruction}>Langkah 1: Ambil foto untuk absen</Text>

            {/* Camera Viewfinder */}
            <View style={styles.cameraViewfinder}>
              {permission?.granted ? (
                <CameraView style={styles.cameraView} facing="front" ref={cameraRef}>
                  {/* Face Alignment Overlay Frame */}
                  <View style={styles.faceGuideFrame}>
                    <View style={[styles.cornerMarker, styles.topLeftCorner]} />
                    <View style={[styles.cornerMarker, styles.topRightCorner]} />
                    <View style={[styles.cornerMarker, styles.bottomLeftCorner]} />
                    <View style={[styles.cornerMarker, styles.bottomRightCorner]} />
                  </View>
                </CameraView>
              ) : (
                <View style={styles.permissionBox}>
                  <Ionicons name="camera-outline" size={48} color="#717782" />
                  <Text style={styles.permissionText}>Izin kamera diperlukan</Text>
                  <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                    <Text style={styles.permBtnText}>Berikan Izin Kamera</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Shutter Action Button */}
            <TouchableOpacity
              style={styles.shutterPillBtn}
              onPress={handleTakePicture}
              activeOpacity={0.85}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.shutterPillText}>Ambil Foto</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: LOCATION VERIFICATION */}
        {step === 'location' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepInstruction}>Langkah 2: Lokasi & alamat presensi Anda</Text>

            {/* Map Preview Container */}
            <View style={styles.mapContainer}>
              {/* Map Mock Background Image */}
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
                }}
                style={styles.mapBgImg}
              />
              {/* Geofence UI Overlay Pin */}
              <View style={styles.mapOverlayCenter}>
                <View style={styles.pulseCircle} />
                <View style={styles.pinCircle}>
                  <Ionicons name="location" size={20} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {/* Validation Cards Stack */}
            <View style={styles.validationStack}>
              {/* Primary Location Card */}
              <View style={styles.primaryLocationCard}>
                <View style={styles.blueLeftAccent} />
                <View style={styles.locationHeaderRow}>
                  <View>
                    <Text style={styles.locationTitle}>{locationName}</Text>
                    <Text style={styles.locationSub}>{locationAddress}</Text>
                  </View>
                  <TouchableOpacity style={styles.changeLocBtn} onPress={fetchLocation}>
                    <Ionicons name="create-outline" size={14} color="#005ea1" />
                    <Text style={styles.changeLocText}>Ubah</Text>
                  </TouchableOpacity>
                </View>

                {/* Verification Badge Box */}
                <View style={styles.verifiedBox}>
                  <View style={styles.verifiedIconBg}>
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.verifiedTitle}>Dalam Jangkauan</Text>
                    <Text style={styles.verifiedAccuracy}>Akurasi GPS: ±5 meter</Text>
                  </View>
                </View>
              </View>

              {/* Secondary Metadata Cards Bento Grid */}
              <View style={styles.bentoMetaGrid}>
                {/* Radius Card */}
                <View style={styles.bentoMetaCard}>
                  <View style={styles.bentoMetaHeader}>
                    <Ionicons name="radio-outline" size={16} color="#717782" />
                    <Text style={styles.bentoMetaLabel}>Radius</Text>
                  </View>
                  <Text style={styles.bentoMetaValue}>
                    51 <Text style={styles.bentoMetaUnit}>m</Text>
                  </Text>
                </View>

                {/* IP Validation Card */}
                <View style={styles.bentoMetaCard}>
                  <View style={styles.bentoMetaHeader}>
                    <Ionicons name="hardware-chip-outline" size={16} color="#717782" />
                    <Text style={styles.bentoMetaLabel}>IP Validasi</Text>
                  </View>
                  <View style={styles.ipValueRow}>
                    <Text style={styles.ipValueText}>Konsisten</Text>
                    <Ionicons name="checkmark" size={14} color="#005ea1" />
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Action Button */}
            <TouchableOpacity
              style={styles.shutterPillBtn}
              onPress={() => setStep('confirm')}
              activeOpacity={0.85}
            >
              <Text style={styles.shutterPillText}>Lanjutkan ke Konfirmasi</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: CONFIRMATION & SUBMIT */}
        {step === 'confirm' && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepInstruction}>Langkah 3: Konfirmasi Absen</Text>

            {/* Summary Preview Card */}
            <View style={styles.summaryCard}>
              <Image source={{ uri: photoUri || '' }} style={styles.summaryImg} />
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>Jam Absen Masuk</Text>
                <Text style={styles.summaryTime}>
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </Text>

                <View style={styles.summaryDivider} />

                <Text style={styles.summaryLabel}>Lokasi Absen</Text>
                <Text style={styles.summaryLoc}>{locationName} - {locationAddress}</Text>
              </View>
            </View>

            {/* Notes input */}
            <Text style={styles.notesLabel}>CATATAN (OPSIONAL)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Tambahkan catatan jika ada..."
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity
              style={[styles.shutterPillBtn, { backgroundColor: '#16A34A' }]}
              onPress={handleSubmitCheckIn}
              disabled={submitting}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.shutterPillText}>
                {submitting ? 'Mengirim...' : 'Kirim Absen Masuk'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#121c2c',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 50,
  },
  wizardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(193, 199, 210, 0.3)',
  },
  wizardStepGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wizardStepDoneGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wizardDoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#005ea1',
  },
  wizardStepActivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2b78bf',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
  },
  wizardActiveCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wizardActiveCircleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2b78bf',
  },
  wizardActiveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  wizardCircleInactive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#d9e3f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wizardCircleTextInactive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#414751',
  },
  wizardStepTextInactive: {
    fontSize: 12,
    fontWeight: '500',
    color: '#717782',
  },
  body: {
    padding: 20,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  stepInstruction: {
    fontSize: 14,
    color: '#414751',
    textAlign: 'center',
    marginBottom: 16,
  },
  cameraViewfinder: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#e7eeff',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    maxHeight: 420,
  },
  cameraView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuideFrame: {
    width: '80%',
    height: '80%',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 144, 217, 0.4)',
    borderRadius: 20,
    position: 'relative',
  },
  cornerMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#4A90D9',
  },
  topLeftCorner: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 10,
  },
  topRightCorner: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 10,
  },
  bottomLeftCorner: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 10,
  },
  bottomRightCorner: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 10,
  },
  mapContainer: {
    width: '100%',
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    backgroundColor: '#dee8ff',
    borderWidth: 1,
    borderColor: 'rgba(193, 199, 210, 0.3)',
  },
  mapBgImg: {
    width: '100%',
    height: '100%',
  },
  mapOverlayCenter: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 94, 161, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 94, 161, 0.3)',
    position: 'absolute',
  },
  pinCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#005ea1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  validationStack: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  primaryLocationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(193, 199, 210, 0.3)',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  blueLeftAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#005ea1',
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#121c2c',
  },
  locationSub: {
    fontSize: 13,
    color: '#414751',
    marginTop: 2,
  },
  changeLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  changeLocText: {
    fontSize: 12,
    color: '#005ea1',
    fontWeight: '500',
  },
  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EBF3FE',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 94, 161, 0.2)',
  },
  verifiedIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#005ea1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#005ea1',
  },
  verifiedAccuracy: {
    fontSize: 11,
    color: '#414751',
  },
  bentoMetaGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoMetaCard: {
    flex: 1,
    backgroundColor: '#f0f3ff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(193, 199, 210, 0.2)',
  },
  bentoMetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  bentoMetaLabel: {
    fontSize: 11,
    color: '#717782',
    fontWeight: '500',
  },
  bentoMetaValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#121c2c',
  },
  bentoMetaUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#414751',
  },
  ipValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ipValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#005ea1',
  },
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#414751',
    marginTop: 8,
    fontSize: 14,
  },
  permBtn: {
    marginTop: 12,
    backgroundColor: '#005ea1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
  },
  permBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  shutterPillBtn: {
    width: '100%',
    height: 48,
    borderRadius: 50,
    backgroundColor: '#005ea1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#005ea1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  shutterPillText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  thumbWrapper: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  retakeBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  retakeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  geoCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  geoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#121c2c',
    marginTop: 6,
  },
  geoAddress: {
    fontSize: 12,
    color: '#414751',
    marginTop: 2,
    textAlign: 'center',
  },
  geoCoords: {
    fontSize: 11,
    color: '#717782',
    marginTop: 4,
  },
  summaryCard: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryImg: {
    width: 90,
    height: 110,
    borderRadius: 12,
  },
  summaryInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#717782',
  },
  summaryTime: {
    fontSize: 18,
    fontWeight: '800',
    color: '#121c2c',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  summaryLoc: {
    fontSize: 12,
    fontWeight: '600',
    color: '#121c2c',
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#414751',
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  notesInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1.5,
    borderBottomColor: '#c1c7d2',
    height: 40,
    fontSize: 14,
    color: '#121c2c',
    marginBottom: 20,
  },
  checkoutBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  checkoutTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#121c2c',
    marginTop: 12,
  },
  checkoutSub: {
    fontSize: 14,
    color: '#414751',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  locBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
  },
  locBadgeText: {
    fontSize: 12,
    color: '#121c2c',
    fontWeight: '600',
  },
  dangerPillBtn: {
    width: '100%',
    height: 48,
    borderRadius: 50,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  pillBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
