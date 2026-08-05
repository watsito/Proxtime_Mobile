import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/providers/AuthProvider';
import { proxtimeService } from '../../src/services/proxtime';
import { adminService } from '../../src/services/adminService';
import { LeaveBalance, LeaveRequest } from '../../src/types';
import { StatusBadge } from '../../src/components/StatusBadge';

export default function LeaveScreen() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Employee State
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<string>('Cuti Tahunan');
  const [startDate, setStartDate] = useState('25 Ags 2026');
  const [endDate, setEndDate] = useState('26 Ags 2026');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin State
  const [adminRequests, setAdminRequests] = useState<LeaveRequest[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const loadLeaveData = async () => {
    try {
      if (isAdmin) {
        setAdminLoading(true);
        const data = await adminService.getAdminLeaveRequests();
        setAdminRequests(data);
        setAdminLoading(false);
      } else {
        const bal = await proxtimeService.getLeaveBalance();
        const reqs = await proxtimeService.getLeaveRequests();
        setBalance(bal);
        setRequests(reqs);
      }
    } catch (err) {
      console.error('Error loading leave data:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLeaveData();
    }, [isAdmin])
  );

  // Admin Actions
  const handleApprove = (id: string, name: string) => {
    Alert.alert(
      'Setujui Pengajuan',
      `Apakah Anda yakin ingin menyetujui pengajuan cuti/izin dari ${name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Setujui',
          onPress: async () => {
            await adminService.approveLeaveRequest(id);
            loadLeaveData();
            Alert.alert('Berhasil', `Pengajuan ${name} telah disetujui.`);
          },
        },
      ]
    );
  };

  const handleReject = (id: string, name: string) => {
    Alert.alert(
      'Tolak Pengajuan',
      `Apakah Anda yakin ingin menolak pengajuan cuti/izin dari ${name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Tolak',
          style: 'destructive',
          onPress: async () => {
            await adminService.rejectLeaveRequest(id);
            loadLeaveData();
            Alert.alert('Ditolak', `Pengajuan ${name} telah ditolak.`);
          },
        },
      ]
    );
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Hapus Request',
      `Apakah Anda yakin ingin menghapus pengajuan dari ${name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await adminService.deleteLeaveRequest(id);
            loadLeaveData();
          },
        },
      ]
    );
  };

  // Employee Form Submit
  const handleSubmitRequest = async () => {
    if (!reason.trim()) {
      Alert.alert('Perhatian', 'Alasan cuti/izin wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      await proxtimeService.submitLeaveRequest(
        'CUTI_TAHUNAN',
        startDate,
        endDate,
        reason
      );

      Alert.alert('Pengajuan Berhasil', 'Pengajuan cuti/izin Anda telah terkirim.', [
        {
          text: 'OK',
          onPress: () => {
            setCurrentStep(1);
            setReason('');
            loadLeaveData();
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat membuat pengajuan.');
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================================
  // RENDER: ADMIN VIEW (Cuti & Izin Approval Center)
  // =========================================================================
  if (isAdmin) {
    return (
      <View style={styles.container}>
        {/* Top Header */}
        <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Cuti & Izin</Text>
            <View style={styles.adminPillBadge}>
              <Text style={styles.adminPillBadgeText}>Admin</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/help')}>
            <Ionicons name="notifications-outline" size={20} color="#005ea1" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={<RefreshControl refreshing={adminLoading} onRefresh={loadLeaveData} />}
        >
          {/* Balance Summary Cards Carousel (Horizontal Scroll) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
          >
            {/* Card 1: Cuti Tahunan */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Cuti Tahunan</Text>
              <View style={styles.balanceValueRow}>
                <Text style={styles.balanceNumber}>0</Text>
                <Text style={styles.balanceTotal}>/ 12</Text>
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

            {/* Card 4: Izin */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Izin</Text>
              <View style={styles.balanceValueRow}>
                <Text style={[styles.balanceNumber, { color: '#005ea1' }]}>1</Text>
                <Text style={styles.balanceTotal}>/ 3</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: '33%' }]} />
              </View>
            </View>
          </ScrollView>

          {/* Section Header */}
          <Text style={styles.sectionTitle}>Daftar Pengajuan Cuti</Text>

          {/* Request Items List */}
          {adminRequests.map((req) => {
            const isPending = req.status === 'Menunggu' || req.status === 'PENDING';
            const isApproved = req.status === 'Disetujui' || req.status === 'APPROVED';
            const isRejected = req.status === 'Ditolak' || req.status === 'REJECTED';

            return (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.reqHeaderRow}>
                  <View style={styles.reqLeftGroup}>
                    <View style={styles.iconBg}>
                      <Ionicons name="calendar-outline" size={18} color="#566069" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.reqTitle}>
                        {req.typeName} <Text style={styles.employeeName}>• {req.employeeName}</Text>
                      </Text>
                      <Text style={styles.reqSub}>
                        {req.startDate} - {req.endDate} • {req.duration || `${req.durationDays} hari`}
                      </Text>
                      <Text style={styles.reqReason}>{req.reason}</Text>
                    </View>
                  </View>

                  {/* Right Action Icons / Status Badge Group */}
                  <View style={styles.reqRightGroup}>
                    {/* Status Badge */}
                    <View
                      style={[
                        styles.statusBadge,
                        isPending && styles.statusBadgePending,
                        isApproved && styles.statusBadgeApproved,
                        isRejected && styles.statusBadgeRejected,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          isPending && styles.statusDotPending,
                          isApproved && styles.statusDotApproved,
                          isRejected && styles.statusDotRejected,
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          isPending && styles.statusTextPending,
                          isApproved && styles.statusTextApproved,
                          isRejected && styles.statusTextRejected,
                        ]}
                      >
                        {req.status}
                      </Text>
                    </View>

                    {/* Admin Action Buttons (Approve / Reject / Trash) */}
                    <View style={styles.actionBtnRow}>
                      {isPending && (
                        <>
                          <TouchableOpacity
                            style={[styles.actionIconBtn, styles.approveBtn]}
                            onPress={() => handleApprove(req.id, req.employeeName || '')}
                          >
                            <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionIconBtn, styles.rejectBtn]}
                            onPress={() => handleReject(req.id, req.employeeName || '')}
                          >
                            <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                          </TouchableOpacity>
                        </>
                      )}

                      <TouchableOpacity
                        style={[styles.actionIconBtn, styles.trashBtn]}
                        onPress={() => handleDelete(req.id, req.employeeName || '')}
                      >
                        <Ionicons name="trash-outline" size={16} color="#717782" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // RENDER: EMPLOYEE VIEW (Cuti & Izin Form)
  // =========================================================================
  return (
    <View style={styles.container}>
      {/* Top Bar Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Cuti & Izin</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
      >
        {/* Horizontal Balance Cards Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {/* Card 1: Cuti Tahunan */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Cuti Tahunan</Text>
            <View style={styles.balanceValueRow}>
              <Text style={styles.balanceNumber}>{balance?.remainingDays ?? 8}</Text>
              <Text style={styles.balanceTotal}>/ {balance?.totalDays ?? 12}</Text>
            </View>
          </View>

          {/* Card 2: Cuti Khusus */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Cuti Khusus</Text>
            <View style={styles.balanceValueRow}>
              <Text style={styles.balanceNumber}>{balance?.specialLeaveUsed ?? 0}</Text>
              <Text style={styles.balanceTotal}>/ {balance?.specialLeaveTotal ?? 2}</Text>
            </View>
          </View>

          {/* Card 3: Cuti Sakit */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Cuti Sakit</Text>
            <View style={styles.balanceValueRow}>
              <Text style={styles.balanceNumber}>{balance?.sickLeaveUsed ?? 0}</Text>
              <Text style={styles.balanceTotal}>/ {balance?.sickLeaveTotal ?? 6}</Text>
            </View>
          </View>

          {/* Card 4: Izin */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Izin</Text>
            <View style={styles.balanceValueRow}>
              <Text style={[styles.balanceNumber, { color: '#005ea1' }]}>
                {balance?.permitUsed ?? 1}
              </Text>
              <Text style={styles.balanceTotal}>/ {balance?.permitTotal ?? 3}</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '33%' }]} />
            </View>
          </View>
        </ScrollView>

        {/* 3-Step Wizard Form Card */}
        <View style={styles.formCard}>
          {/* Form Header */}
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Pengajuan Cuti / Izin</Text>

            {/* Stepper Dots Indicator */}
            <View style={styles.stepperContainer}>
              <View style={[styles.stepBadge, currentStep >= 1 && styles.stepBadgeActive]}>
                <Text style={[styles.stepBadgeText, currentStep >= 1 && styles.stepBadgeTextActive]}>
                  1
                </Text>
              </View>
              <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />

              <View style={[styles.stepBadge, currentStep >= 2 && styles.stepBadgeActive]}>
                <Text style={[styles.stepBadgeText, currentStep >= 2 && styles.stepBadgeTextActive]}>
                  2
                </Text>
              </View>
              <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />

              <View style={[styles.stepBadge, currentStep >= 3 && styles.stepBadgeActive]}>
                <Text style={[styles.stepBadgeText, currentStep >= 3 && styles.stepBadgeTextActive]}>
                  3
                </Text>
              </View>
            </View>
          </View>

          {/* STEP 1: Pilih Tipe Cuti */}
          {currentStep === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Pilih Tipe Cuti / Izin</Text>

              <TouchableOpacity
                style={[styles.typeOptionCard, selectedType === 'Cuti Tahunan' && styles.typeOptionActive]}
                onPress={() => setSelectedType('Cuti Tahunan')}
                activeOpacity={0.8}
              >
                <View style={styles.typeIconBg}>
                  <Ionicons name="calendar-outline" size={20} color="#005ea1" />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>Cuti Tahunan</Text>
                  <Text style={styles.typeSub}>Pengajuan cuti reguler tahunan (Sisa: 8 hari)</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeOptionCard, selectedType === 'Izin Telat / Pulang Awal' && styles.typeOptionActive]}
                onPress={() => setSelectedType('Izin Telat / Pulang Awal')}
                activeOpacity={0.8}
              >
                <View style={[styles.typeIconBg, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="time-outline" size={20} color="#E65100" />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>Izin Telat / Pulang Awal</Text>
                  <Text style={styles.typeSub}>Izin keperluan mendesak jam kerja</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeOptionCard, selectedType === 'Cuti Sakit' && styles.typeOptionActive]}
                onPress={() => setSelectedType('Cuti Sakit')}
                activeOpacity={0.8}
              >
                <View style={[styles.typeIconBg, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="fitness-outline" size={20} color="#DC2626" />
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>Cuti Sakit</Text>
                  <Text style={styles.typeSub}>Disertai surat keterangan dokter</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => setCurrentStep(2)}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>Lanjutkan Ke Detail</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Detail Tanggal & Alasan */}
          {currentStep === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Detail Tanggal & Alasan</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipe Yang Dipilih</Text>
                <TextInput
                  style={[styles.inputBox, styles.inputDisabled]}
                  value={selectedType}
                  editable={false}
                />
              </View>

              <View style={styles.dateRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Tanggal Mulai</Text>
                  <TextInput
                    style={styles.inputBox}
                    value={startDate}
                    onChangeText={setStartDate}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Tanggal Selesai</Text>
                  <TextInput
                    style={styles.inputBox}
                    value={endDate}
                    onChangeText={setEndDate}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alasan / Keterangan</Text>
                <TextInput
                  style={[styles.inputBox, styles.textArea]}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Tuliskan alasan pengajuan cuti/izin Anda..."
                  placeholderTextColor="#717782"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.backStepBtn}
                  onPress={() => setCurrentStep(1)}
                >
                  <Text style={styles.backStepBtnText}>Kembali</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.nextBtn, { flex: 1 }]}
                  onPress={() => {
                    if (!reason.trim()) {
                      Alert.alert('Perhatian', 'Alasan cuti wajib diisi.');
                      return;
                    }
                    setCurrentStep(3);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.nextBtnText}>Tinjau Pengajuan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: Review & Submit */}
          {currentStep === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Konfirmasi Pengajuan</Text>

              <View style={styles.reviewBox}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Tipe Pengajuan:</Text>
                  <Text style={styles.reviewValue}>{selectedType}</Text>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Periode Tanggal:</Text>
                  <Text style={styles.reviewValue}>
                    {startDate} - {endDate}
                  </Text>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Alasan:</Text>
                  <Text style={styles.reviewValue}>{reason}</Text>
                </View>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.backStepBtn}
                  onPress={() => setCurrentStep(2)}
                >
                  <Text style={styles.backStepBtnText}>Ubah</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.nextBtn, styles.submitBtn, { flex: 1 }]}
                  onPress={handleSubmitRequest}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  <Text style={styles.nextBtnText}>
                    {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Riwayat Pengajuan Karyawan */}
        <Text style={styles.sectionTitle}>Riwayat Pengajuan Saya</Text>

        {requests.map((req) => (
          <View key={req.id} style={styles.historyCardItem}>
            <View style={styles.historyItemHeader}>
              <Text style={styles.historyItemType}>{req.typeName || req.type}</Text>
              <StatusBadge status={req.status} />
            </View>

            <Text style={styles.historyItemDate}>
              {req.startDate} - {req.endDate} ({req.durationDays} hari)
            </Text>
            <Text style={styles.historyItemReason}>{req.reason}</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#005ea1',
  },
  adminPillBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 50,
  },
  adminPillBadgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121C2C',
    marginTop: 4,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  reqHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reqLeftGroup: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reqTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121C2C',
  },
  employeeName: {
    fontWeight: '400',
    color: '#566069',
  },
  reqSub: {
    fontSize: 12,
    color: '#566069',
    marginTop: 2,
  },
  reqReason: {
    fontSize: 12,
    color: '#414751',
    marginTop: 4,
  },
  reqRightGroup: {
    alignItems: 'flex-end',
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeApproved: {
    backgroundColor: '#E6F4EA',
  },
  statusBadgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotPending: {
    backgroundColor: '#D97706',
  },
  statusDotApproved: {
    backgroundColor: '#1E8E3E',
  },
  statusDotRejected: {
    backgroundColor: '#DC2626',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusTextApproved: {
    color: '#1E8E3E',
  },
  statusTextRejected: {
    color: '#DC2626',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  approveBtn: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  trashBtn: {
    backgroundColor: '#F1F5F9',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 14,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121C2C',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeActive: {
    backgroundColor: '#005ea1',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 14,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  stepLineActive: {
    backgroundColor: '#005ea1',
  },
  stepContent: {
    gap: 14,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121C2C',
    marginBottom: 4,
  },
  typeOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  typeOptionActive: {
    backgroundColor: '#EBF3FE',
    borderColor: '#005ea1',
  },
  typeIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF3FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121C2C',
  },
  typeSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#005ea1',
    height: 48,
    borderRadius: 50,
    marginTop: 8,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#566069',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#121C2C',
    backgroundColor: '#FFFFFF',
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  backStepBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  backStepBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  reviewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#121C2C',
  },
  submitBtn: {
    backgroundColor: '#16A34A',
  },
  historyCardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121C2C',
  },
  historyItemDate: {
    fontSize: 12,
    color: '#005ea1',
    fontWeight: '600',
  },
  historyItemReason: {
    fontSize: 12,
    color: '#566069',
  },
});
