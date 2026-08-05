import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/providers/AuthProvider';
import { proxtimeService } from '../../src/services/proxtime';
import { AttendanceRecord, AttendanceSummary, NotificationItem } from '../../src/types';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeString, setTimeString] = useState<string>('00:00:00');
  const [dateString, setDateString] = useState<string>('');

  // Real-time Clock update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTimeString(`${h}:${m}:${s}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
      setDateString(now.toLocaleDateString('id-ID', options).toUpperCase());
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const record = await proxtimeService.getTodayAttendance();
      const sum = await proxtimeService.getAttendanceSummary();
      const notifs = await proxtimeService.getNotifications();
      setTodayRecord(record);
      setSummary(sum);
      setNotifications(notifs);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleOpenNotifications = async () => {
    setNotifModalVisible(true);
    await proxtimeService.markNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const hasUnreadNotif = notifications.some((n) => !n.read);
  const hasClockedIn = !!todayRecord?.clockIn;
  const hasClockedOut = !!todayRecord?.clockOut;

  return (
    <View style={styles.container}>
      {/* Sticky Top Bar Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.userInfoGroup}>
          <Image source={{ uri: user?.avatarUrl }} style={styles.avatar} />
          <View>
            <Text style={styles.appTitle}>Attendance</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.position || 'Senior Engineer'}</Text>
            </View>
          </View>
        </View>

        {/* Notification Icon Button */}
        <TouchableOpacity style={styles.notifBtn} onPress={handleOpenNotifications} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={22} color="#005ea1" />
          {hasUnreadNotif ? <View style={styles.notifDot} /> : null}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Primary Action Hero Card (Blue Gradient Card) */}
        <View style={styles.heroCard}>
          {/* Decorative Circles */}
          <View style={styles.circleTopRight} />
          <View style={styles.circleBottomLeft} />

          {/* Date Display */}
          <Text style={styles.heroDateText}>{dateString || 'SELASA, 4 AGUSTUS 2026'}</Text>

          {/* Live Digital Clock */}
          <View style={styles.clockRow}>
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.digitalClock}>{timeString}</Text>
          </View>

          {/* Status Badge Pill */}
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusPillText}>
              {!hasClockedIn
                ? 'Belum Check-in'
                : !hasClockedOut
                ? `Sudah Check-in (${todayRecord?.clockIn})`
                : 'Sudah Check-out'}
            </Text>
          </View>

          {/* Main Action Button */}
          {!hasClockedIn ? (
            <TouchableOpacity
              style={styles.actionBtnWhite}
              onPress={() => router.push({ pathname: '/check-in', params: { mode: 'check-in' } })}
              activeOpacity={0.85}
            >
              <Ionicons name="log-in-outline" size={22} color="#005ea1" />
              <Text style={styles.actionBtnWhiteText}>Check-in</Text>
            </TouchableOpacity>
          ) : !hasClockedOut ? (
            <TouchableOpacity
              style={styles.actionBtnWhite}
              onPress={() => router.push({ pathname: '/check-in', params: { mode: 'check-out' } })}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={22} color="#DC2626" />
              <Text style={[styles.actionBtnWhiteText, { color: '#DC2626' }]}>Check-out</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedBox}>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <Text style={styles.completedBoxText}>Absensi Hari Ini Selesai</Text>
            </View>
          )}

          <Text style={styles.heroFootnote}>
            Proses check-in terdiri dari 3 langkah: foto, lokasi, dan konfirmasi
          </Text>
        </View>

        {/* Bento Grid Stats Section */}
        <View style={styles.bentoGrid}>
          {/* Card 1: Kehadiran Bulan Ini */}
          <View style={styles.bentoCard}>
            <View style={styles.bentoCardHeader}>
              <Ionicons name="calendar" size={18} color="#045fa0" />
              <Text style={styles.bentoCardTitle}>Kehadiran Bulan Ini</Text>
            </View>

            <Text style={styles.bentoValue}>
              {summary?.totalPresent || 18}
              <Text style={styles.bentoSubValue}>/22 Hari</Text>
            </Text>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '81%', backgroundColor: '#005ea1' }]} />
            </View>
          </View>

          {/* Card 2: Jam Kerja */}
          <View style={styles.bentoCard}>
            <View style={styles.bentoCardHeader}>
              <Ionicons name="time" size={18} color="#045fa0" />
              <Text style={styles.bentoCardTitle}>Jam Kerja</Text>
            </View>

            <Text style={styles.bentoValue}>
              142 <Text style={styles.bentoSubValue}>Jam</Text>
            </Text>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '70%', backgroundColor: '#3278bb' }]} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Notification Modal */}
      <Modal
        visible={notifModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleGroup}>
                <Ionicons name="notifications-outline" size={22} color="#005ea1" />
                <Text style={styles.modalTitle}>Notifikasi ProxTime</Text>
              </View>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#566069" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.notifListContent}
              renderItem={({ item }) => (
                <View style={[styles.notifCard, !item.read && styles.notifCardUnread]}>
                  <View style={styles.notifIconBox}>
                    <Ionicons
                      name={
                        item.type === 'success'
                          ? 'checkmark-circle'
                          : item.type === 'warning'
                          ? 'warning'
                          : 'information-circle'
                      }
                      size={24}
                      color={
                        item.type === 'success'
                          ? '#16A34A'
                          : item.type === 'warning'
                          ? '#D97706'
                          : '#005ea1'
                      }
                    />
                  </View>

                  <View style={styles.notifBody}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifMessage}>{item.message}</Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
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
  userInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E7EEFF',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#005ea1',
    lineHeight: 26,
  },
  roleBadge: {
    backgroundColor: '#DEE8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#566069',
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BA1A1A',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },
  heroCard: {
    backgroundColor: '#005ea1',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#00497e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 6,
  },
  circleTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  digitalClock: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 50,
    marginBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  statusPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionBtnWhite: {
    width: '100%',
    maxWidth: 240,
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnWhiteText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#005ea1',
  },
  completedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  completedBoxText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  heroFootnote: {
    marginTop: 20,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bentoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  bentoCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3278bb',
  },
  bentoValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#121C2C',
  },
  bentoSubValue: {
    fontSize: 13,
    fontWeight: '400',
    color: '#566069',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#DEE8FF',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
  },
  modalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#005ea1',
  },
  modalCloseBtn: {
    padding: 4,
  },
  notifListContent: {
    paddingBottom: 16,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifCardUnread: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  notifIconBox: {
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  notifBody: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  notifMessage: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  notifTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
  },
});
