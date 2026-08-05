import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adminService } from '../../src/services/adminService';
import { LeaveRequest } from '../../src/types';

export default function AdminLeaveApprovalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAdminLeaveRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error loading admin leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

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
            loadRequests();
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
            loadRequests();
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
            loadRequests();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#121C2C" />
          </TouchableOpacity>
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRequests} />}
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
        {requests.map((req) => {
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

                  <View>
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
  backBtn: {
    padding: 4,
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
});
