import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adminService } from '../../src/services/adminService';
import { ActivityFeedItem } from '../../src/types';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Digital clock timer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}.${minutes}.${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <View style={styles.container}>
      {/* Top Bar Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTitleGroup}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#121C2C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard Karyawan</Text>
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
        {/* Quick Admin Navigation Toolbar */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => router.push('/admin/leave-approvals')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickNavIconBg, { backgroundColor: '#EBF3FE' }]}>
              <Ionicons name="document-text-outline" size={20} color="#005ea1" />
            </View>
            <Text style={styles.quickNavText}>Cuti & Izin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => router.push('/admin/employees')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickNavIconBg, { backgroundColor: '#E6F4EA' }]}>
              <Ionicons name="people-outline" size={20} color="#1E8E3E" />
            </View>
            <Text style={styles.quickNavText}>Karyawan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => router.push('/admin/settings')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickNavIconBg, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="settings-outline" size={20} color="#E65100" />
            </View>
            <Text style={styles.quickNavText}>Pengaturan</Text>
          </TouchableOpacity>
        </View>

        {/* Top 4 Stat Cards Carousel/Grid */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statCardsContainer}
        >
          {/* Card 1: Total Hadir */}
          <View style={[styles.statCard, { backgroundColor: '#E6F4EA' }]}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Total Hadir (Bulan Ini)</Text>
              <Ionicons name="checkmark-circle-outline" size={20} color="#1E8E3E" />
            </View>
            <Text style={[styles.statCardNumber, { color: '#1E8E3E' }]}>3</Text>
          </View>

          {/* Card 2: Total Terlambat */}
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Total Terlambat</Text>
              <Ionicons name="warning-outline" size={20} color="#D97706" />
            </View>
            <Text style={[styles.statCardNumber, { color: '#D97706' }]}>2</Text>
          </View>

          {/* Card 3: Sisa Cuti */}
          <View style={[styles.statCard, { backgroundColor: '#E0F2FE' }]}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Sisa Cuti</Text>
              <Ionicons name="calendar-outline" size={20} color="#0284C7" />
            </View>
            <Text style={[styles.statCardNumber, { color: '#0284C7' }]}>8</Text>
          </View>

          {/* Card 4: Jam Lembur */}
          <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardLabel}>Jam Lembur</Text>
              <Ionicons name="time-outline" size={20} color="#9333EA" />
            </View>
            <Text style={[styles.statCardNumber, { color: '#9333EA' }]}>1</Text>
          </View>
        </ScrollView>

        {/* Hero Digital Clock Card (Gradient Blue) */}
        <View style={styles.heroCard}>
          <Text style={styles.heroDateText}>RABU, 5 AGUSTUS 2026</Text>
          <View style={styles.heroClockRow}>
            <Ionicons name="time-outline" size={28} color="#FFFFFF" />
            <Text style={styles.heroClockText}>{currentTime || '13.36.29'}</Text>
          </View>

          <View style={styles.heroPillStatus}>
            <Text style={styles.heroPillStatusText}>Selesai Hari Ini</Text>
          </View>

          <View style={styles.checkTimesRow}>
            <View style={styles.checkTimeCol}>
              <Text style={styles.checkTimeLabel}>➔| CHECK-IN</Text>
              <Text style={styles.checkTimeValue}>08:49</Text>
            </View>

            <View style={styles.checkTimeCol}>
              <Text style={styles.checkTimeLabel}>|➔ CHECK-OUT</Text>
              <Text style={styles.checkTimeValue}>17:26</Text>
            </View>
          </View>

          <View style={styles.doneBtn}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.doneBtnText}>Absensi Selesai</Text>
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
  quickNavRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickNavCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickNavIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickNavText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#121C2C',
  },
  statCardsContainer: {
    gap: 12,
    paddingRight: 16,
  },
  statCard: {
    minWidth: 140,
    borderRadius: 16,
    padding: 14,
    justifyContent: 'center',
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
    fontSize: 24,
    fontWeight: '800',
  },
  heroCard: {
    backgroundColor: '#2563EB',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  heroDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
  heroClockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  heroClockText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroPillStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 50,
    marginBottom: 16,
  },
  heroPillStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  checkTimesRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  checkTimeCol: {
    alignItems: 'center',
  },
  checkTimeLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  checkTimeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
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
