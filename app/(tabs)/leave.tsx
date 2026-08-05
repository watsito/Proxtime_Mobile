import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { proxtimeService } from '../../src/services/proxtime';
import { LeaveBalance, LeaveRequest } from '../../src/types';
import { StatusBadge } from '../../src/components/StatusBadge';

export default function LeaveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  // Stepper State (1: Tipe Cuti, 2: Detail, 3: Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<string>('Cuti Tahunan');

  // Form Inputs State
  const [startDate, setStartDate] = useState('25 Ags 2026');
  const [endDate, setEndDate] = useState('26 Ags 2026');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadLeaveData = async () => {
    try {
      const bal = await proxtimeService.getLeaveBalance();
      const reqs = await proxtimeService.getLeaveRequests();
      setBalance(bal);
      setRequests(reqs);
    } catch (err) {
      console.error('Error loading leave data:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLeaveData();
    }, [])
  );

  const leaveTypesList = [
    'Cuti Tahunan',
    'Cuti Sakit',
    'Cuti Pribadi',
    'Izin Telat Datang',
    'Izin Pulang Cepat',
    'Cuti Menikah',
    'Cuti Melahirkan',
    'Cuti Keagamaan',
  ];

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Peringatan', 'Harap isi alasan permohonan cuti/izin.');
      return;
    }

    setSubmitting(true);
    try {
      await proxtimeService.submitLeaveRequest(
        'CUTI_TAHUNAN',
        startDate,
        endDate,
        `${selectedType}: ${reason}`
      );
      Alert.alert('Berhasil', 'Permohonan cuti/izin berhasil diajukan.');
      setReason('');
      setCurrentStep(1);
      await loadLeaveData();
    } catch (err: any) {
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Sticky Top Bar Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.appTitle}>Cuti & Izin</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
      >
        {/* Balance Summary Cards (Horizontal Scroll Carousel) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {/* Card 1: Cuti Tahunan */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Cuti Tahunan</Text>
            <View style={styles.balanceValueRow}>
              <Text style={styles.balanceNumber}>{balance?.usedDays || 0}</Text>
              <Text style={styles.balanceTotal}>/ {balance?.totalDays || 12}</Text>
            </View>
          </View>

          {/* Card 2: Cuti Khusus */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Cuti Khusus</Text>
            <View style={styles.balanceValueRow}>
              <Text style={styles.balanceNumber}>0</Text>
              <Text style={styles.balanceTotal}>/ 2</Text>
            </View>
          </View>

          {/* Card 3: Cuti Sakit */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Cuti Sakit</Text>
            <View style={styles.balanceValueRow}>
              <Text style={styles.balanceNumber}>0</Text>
              <Text style={styles.balanceTotal}>/ 6</Text>
            </View>
          </View>

          {/* Card 4: Izin (With Progress Bar) */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Izin</Text>
            <View style={styles.balanceValueRow}>
              <Text style={[styles.balanceNumber, { color: '#005ea1' }]}>2</Text>
              <Text style={styles.balanceTotal}>/ 3</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '66%' }]} />
            </View>
          </View>
        </ScrollView>

        {/* Main Action Card: "Ajukan Cuti & Izin" */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardTitle}>Ajukan Cuti & Izin</Text>

          {/* Stepper Header */}
          <View style={styles.stepperWrapper}>
            <View style={styles.stepperLine} />

            {/* Step 1 */}
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => setCurrentStep(1)}
              activeOpacity={0.7}
            >
              <View style={[styles.stepCircle, currentStep >= 1 ? styles.stepCircleActive : styles.stepCircleInactive]}>
                <Text style={[styles.stepCircleText, currentStep >= 1 && styles.stepCircleTextActive]}>1</Text>
              </View>
              <Text style={[styles.stepLabel, currentStep === 1 && styles.stepLabelActive]}>Tipe Cuti</Text>
            </TouchableOpacity>

            {/* Step 2 */}
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => setCurrentStep(2)}
              activeOpacity={0.7}
            >
              <View style={[styles.stepCircle, currentStep >= 2 ? styles.stepCircleActive : styles.stepCircleInactive]}>
                <Text style={[styles.stepCircleText, currentStep >= 2 && styles.stepCircleTextActive]}>2</Text>
              </View>
              <Text style={[styles.stepLabel, currentStep === 2 && styles.stepLabelActive]}>Detail</Text>
            </TouchableOpacity>

            {/* Step 3 */}
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => setCurrentStep(3)}
              activeOpacity={0.7}
            >
              <View style={[styles.stepCircle, currentStep >= 3 ? styles.stepCircleActive : styles.stepCircleInactive]}>
                <Text style={[styles.stepCircleText, currentStep >= 3 && styles.stepCircleTextActive]}>3</Text>
              </View>
              <Text style={[styles.stepLabel, currentStep === 3 && styles.stepLabelActive]}>Review</Text>
            </TouchableOpacity>
          </View>

          {/* STEP 1: SELECTION GRID */}
          {currentStep === 1 && (
            <View style={styles.typeGrid}>
              {leaveTypesList.map((type, idx) => {
                const isSelected = selectedType === type;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.typePillBtn, isSelected && styles.typePillBtnActive]}
                    onPress={() => handleSelectType(type)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.typePillText, isSelected && styles.typePillTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* STEP 2: DETAIL INPUTS */}
          {currentStep === 2 && (
            <View style={styles.stepContentBox}>
              <Text style={styles.selectedTypeBadge}>Tipe Dipilih: {selectedType}</Text>

              <View style={styles.dateRow}>
                <View style={styles.dateCol}>
                  <Text style={styles.fieldLabel}>TANGGAL MULAI</Text>
                  <TextInput
                    style={styles.underlineInput}
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="e.g. 25 Ags 2026"
                  />
                </View>
                <View style={styles.dateCol}>
                  <Text style={styles.fieldLabel}>TANGGAL SELESAI</Text>
                  <TextInput
                    style={styles.underlineInput}
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="e.g. 26 Ags 2026"
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>ALASAN PENGAJUAN</Text>
              <TextInput
                style={[styles.underlineInput, styles.textArea]}
                placeholder="Tuliskan alasan pengajuan secara rinci..."
                multiline
                numberOfLines={3}
                value={reason}
                onChangeText={setReason}
              />

              <TouchableOpacity
                style={styles.primaryPillBtn}
                onPress={() => setCurrentStep(3)}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryPillBtnText}>Lanjut ke Review</Text>
                <Ionicons name="arrow-forward-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: REVIEW & SUBMIT */}
          {currentStep === 3 && (
            <View style={styles.stepContentBox}>
              <View style={styles.reviewCard}>
                <Text style={styles.reviewLabel}>Jenis Pengajuan</Text>
                <Text style={styles.reviewValue}>{selectedType}</Text>

                <View style={styles.reviewDivider} />

                <Text style={styles.reviewLabel}>Periode Tanggal</Text>
                <Text style={styles.reviewValue}>{startDate} - {endDate}</Text>

                <View style={styles.reviewDivider} />

                <Text style={styles.reviewLabel}>Alasan</Text>
                <Text style={styles.reviewValue}>{reason || 'Tidak ada alasan tambahan'}</Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryPillBtn, submitting && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryPillBtnText}>
                  {submitting ? 'Mengirim...' : 'Kirim Pengajuan Cuti'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* History Requests Section */}
        <Text style={styles.sectionHeaderTitle}>RIWAYAT PENGAJUAN CUTI</Text>
        {requests.map((req) => (
          <View key={req.id} style={styles.reqCard}>
            <View style={styles.reqHeader}>
              <Text style={styles.reqType}>{req.typeName}</Text>
              <StatusBadge status={req.status} />
            </View>
            <Text style={styles.reqDate}>
              {req.startDate} - {req.endDate} ({req.durationDays} hari)
            </Text>
            <Text style={styles.reqReason}>{req.reason}</Text>
            <Text style={styles.reqFooter}>Diajukan pada {req.submittedAt}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 10,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#005ea1',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  carouselContainer: {
    gap: 12,
    paddingRight: 16,
  },
  balanceCard: {
    minWidth: 135,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#566069',
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  balanceNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#121C2C',
  },
  balanceTotal: {
    fontSize: 14,
    color: '#566069',
    marginBottom: 2,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#dee8ff',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#005ea1',
    borderRadius: 3,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
  },
  mainCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#121C2C',
    marginBottom: 20,
  },
  stepperWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  stepperLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 16,
    height: 2,
    backgroundColor: '#dee8ff',
    zIndex: 1,
  },
  stepItem: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    zIndex: 2,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  stepCircleInactive: {
    backgroundColor: '#dee8ff',
  },
  stepCircleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#566069',
  },
  stepCircleTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    color: '#566069',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typePillBtn: {
    width: '48%',
    backgroundColor: '#f9f9ff',
    borderWidth: 1,
    borderColor: '#c1c7d2',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typePillBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563eb',
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#121C2C',
    textAlign: 'center',
  },
  typePillTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  stepContentBox: {
    gap: 16,
  },
  selectedTypeBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#005ea1',
    backgroundColor: '#DEE8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#566069',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  underlineInput: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#c1c7d2',
    height: 38,
    fontSize: 14,
    color: '#121C2C',
    paddingVertical: 2,
  },
  textArea: {
    height: 70,
  },
  primaryPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#005ea1',
    height: 48,
    borderRadius: 50,
    gap: 8,
    marginTop: 8,
    shadowColor: '#005ea1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryPillBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c1c7d2',
    gap: 6,
  },
  reviewLabel: {
    fontSize: 11,
    color: '#566069',
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121C2C',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#566069',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  reqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 4,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reqType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121C2C',
  },
  reqDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#005ea1',
    marginTop: 2,
  },
  reqReason: {
    fontSize: 12,
    color: '#566069',
    marginVertical: 4,
  },
  reqFooter: {
    fontSize: 10,
    color: '#717782',
  },
});
