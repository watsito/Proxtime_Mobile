import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adminService } from '../../src/services/adminService';
import { ActivityFeedItem } from '../../src/types';

export const TOP_EARLIEST_ATTENDANCE = [
  { id: 't1', name: 'Heru Rizky Fajar', time: '08:02', dept: 'Engineering', rank: 1 },
  { id: 't2', name: 'Denish Twidovant', time: '08:16', dept: 'Engineering', rank: 2 },
  { id: 't3', name: 'Vlosa Rayhan Pratama', time: '08:43', dept: 'Engineering', rank: 3 },
  { id: 't4', name: 'Fikhaar Hafiidz Ramadhan', time: '08:49', dept: 'Engineering', rank: 4 },
  { id: 't5', name: 'Muhammad Raihan Ramadhan', time: '08:49', dept: 'Engineering', rank: 5 },
];

export default function AdminDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const items = await adminService.getActivityFeed();
      setFeed(items);
    } catch (err) {
      console.error('Error loading admin feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleExport = () => {
    Alert.alert('Export Berhasil', 'Laporan absensi berhasil diexport dalam format Excel/PDF.');
  };

  return (
    <View style={styles.container}>
      {/* Top Bar Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTitleGroup}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#121C2C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard Admin</Text>
          <View style={styles.adminPillBadge}>
            <Text style={styles.adminPillBadgeText}>Admin</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.closeAdminBtn} onPress={() => router.replace('/(tabs)/profile')}>
          <Ionicons name="close" size={20} color="#566069" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAdminData} />}
      >
        {/* Sub-header Title */}
        <View style={styles.subHeaderRow}>
          <View>
            <Text style={styles.overviewTitle}>Overview Perusahaan</Text>
            <Text style={styles.overviewDate}>Rabu, 5 Agustus 2026</Text>
          </View>
        </View>

        {/* Top 4 Stat Cards Grid (Matching proxtime_web) */}
        <View style={styles.statGrid}>
          {/* Card 1: Total Karyawan */}
          <View style={[styles.statCard, { backgroundColor: '#EBF3FE' }]}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Total Karyawan</Text>
              <Ionicons name="people-outline" size={20} color="#005ea1" />
            </View>
            <Text style={[styles.statCardNumber, { color: '#005ea1' }]}>11</Text>
          </View>

          {/* Card 2: Hadir Hari Ini */}
          <View style={[styles.statCard, { backgroundColor: '#E6F4EA' }]}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Hadir Hari Ini</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color="#1E8E3E" />
            </View>
            <Text style={[styles.statCardNumber, { color: '#1E8E3E' }]}>6</Text>
          </View>

          {/* Card 3: Terlambat */}
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Terlambat</Text>
              <Ionicons name="warning-outline" size={20} color="#D97706" />
            </View>
            <Text style={[styles.statCardNumber, { color: '#D97706' }]}>2</Text>
          </View>

          {/* Card 4: Tidak Hadir */}
          <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Tidak Hadir</Text>
              <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
            </View>
            <Text style={[styles.statCardNumber, { color: '#DC2626' }]}>3</Text>
          </View>
        </View>

        {/* Quick Admin Navigation Toolbar */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => router.push('/admin/leave-approvals')}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={16} color="#005ea1" />
            <Text style={styles.quickNavText}>Cuti & Izin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => router.push('/admin/employees')}
            activeOpacity={0.8}
          >
            <Ionicons name="people-outline" size={16} color="#1E8E3E" />
            <Text style={styles.quickNavText}>Karyawan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => router.push('/admin/settings')}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={16} color="#E65100" />
            <Text style={styles.quickNavText}>Pengaturan</Text>
          </TouchableOpacity>
        </View>

        {/* Card: Absen Paling Cepat (Top 5 Early Arrival) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="trophy-outline" size={20} color="#D97706" />
              <Text style={styles.sectionTitle}>Absen Paling Cepat</Text>
            </View>
            <Text style={styles.subTagText}>Top 5 Hari Ini</Text>
          </View>

          <View style={styles.earliestList}>
            {TOP_EARLIEST_ATTENDANCE.map((item) => (
              <View key={item.id} style={styles.earliestRow}>
                <View
                  style={[
                    styles.rankBadge,
                    item.rank === 1 && styles.rankBadge1,
                    item.rank === 2 && styles.rankBadge2,
                    item.rank === 3 && styles.rankBadge3,
                  ]}
                >
                  <Text
                    style={[
                      styles.rankText,
                      item.rank <= 3 && styles.rankTextTop,
                    ]}
                  >
                    {item.rank}
                  </Text>
                </View>

                <View style={styles.earliestInfo}>
                  <Text style={styles.earliestName}>{item.name}</Text>
                  <Text style={styles.earliestDept}>{item.dept}</Text>
                </View>

                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={13} color="#005ea1" />
                  <Text style={styles.timeBadgeText}>{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Card Aktivitas Langsung (Real-time Team Feed) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="pulse-outline" size={20} color="#005ea1" />
              <Text style={styles.sectionTitle}>Aktivitas Langsung</Text>
            </View>
            <View style={styles.liveDot} />
          </View>

          <View style={styles.feedList}>
            {feed.map((item) => (
              <View key={item.id} style={styles.feedItemRow}>
                <View style={styles.feedAvatar}>
                  <Text style={styles.feedAvatarText}>{item.avatarInitial}</Text>
                </View>

                <View style={styles.feedInfo}>
                  <Text style={styles.feedName}>{item.employeeName}</Text>
                  <Text style={styles.feedSub}>
                    <Text style={styles.feedActionText}>{item.action}</Text> • {item.time} • {item.location}
                  </Text>
                </View>

                <View style={styles.feedActionIconBg}>
                  <Ionicons name="log-out-outline" size={16} color="#D97706" />
                </View>
              </View>
            ))}
          </View>
        </View>
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
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#121C2C',
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
  closeAdminBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  subHeaderRow: {
    marginBottom: 4,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#121C2C',
  },
  overviewDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  statCardNumber: {
    fontSize: 26,
    fontWeight: '900',
  },
  quickNavRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#005ea1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
  },
  actionPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickNavText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#121C2C',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121C2C',
  },
  subTagText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  earliestList: {
    gap: 10,
  },
  earliestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadge1: {
    backgroundColor: '#FEF08A',
  },
  rankBadge2: {
    backgroundColor: '#E2E8F0',
  },
  rankBadge3: {
    backgroundColor: '#FFEDD5',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  rankTextTop: {
    color: '#121C2C',
  },
  earliestInfo: {
    flex: 1,
  },
  earliestName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#121C2C',
  },
  earliestDept: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF3FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#005ea1',
  },
  feedList: {
    gap: 12,
  },
  feedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  feedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  feedAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  feedInfo: {
    flex: 1,
  },
  feedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#121C2C',
  },
  feedSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  feedActionText: {
    color: '#D97706',
    fontWeight: '600',
  },
  feedActionIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
