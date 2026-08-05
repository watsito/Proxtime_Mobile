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
import { adminService } from '../../src/services/adminService';
import { AttendanceRecord, AttendanceSummary, NotificationItem, ActivityFeedItem } from '../../src/types';

export default function DashboardScreen() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Employee State
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeString, setTimeString] = useState<string>('00:00:00');
  const [dateString, setDateString] = useState<string>('');

  // Admin State
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

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
      if (isAdmin) {
        setAdminLoading(true);
        const items = await adminService.getActivityFeed();
        setFeed(items);
        setAdminLoading(false);
      }
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
    }, [isAdmin])
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

  // =========================================================================
  // RENDER: ADMIN DASHBOARD (When Role is Admin)
  // =========================================================================
  if (isAdmin) {
    return (
      <View style={styles.container}>
        {/* Sticky Top Bar Header for Admin */}
        <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Dashboard Karyawan</Text>
            <View style={styles.adminPillBadge}>
              <Text style={styles.adminPillBadgeText}>Admin</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notifBtn} onPress={handleOpenNotifications} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={22} color="#005ea1" />
            {hasUnreadNotif && <View style={styles.notifBadgeDot} />}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={<RefreshControl refreshing={refreshing || adminLoading} onRefresh={onRefresh} />}
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
            <Text style={styles.heroDateText}>{dateString || 'RABU, 5 AGUSTUS 2026'}</Text>
            <View style={styles.heroClockRow}>
              <Ionicons name="time-outline" size={28} color="#FFFFFF" />
              <Text style={styles.heroClockText}>{timeString}</Text>
            </View>

            <View style={styles.heroPillStatus}>
              <Text style={styles.heroPillStatusText}>
                {hasClockedOut ? 'Selesai Hari Ini' : hasClockedIn ? 'Sedang Bekerja' : 'Belum Absen'}
              </Text>
            </View>

            <View style={styles.checkTimesRow}>
              <View style={styles.checkTimeCol}>
                <Text style={styles.checkTimeLabel}>➔| CHECK-IN</Text>
                <Text style={styles.checkTimeValue}>{todayRecord?.clockIn || '08:49'}</Text>
              </View>

              <View style={styles.checkTimeCol}>
                <Text style={styles.checkTimeLabel}>|➔ CHECK-OUT</Text>
                <Text style={styles.checkTimeValue}>{todayRecord?.clockOut || '17:26'}</Text>
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

        {/* Notifications Modal Sheet */}
        <Modal
          visible={notifModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setNotifModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setNotifModalVisible(false)}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalIndicator} />
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Notifikasi</Text>
                <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                  <Ionicons name="close" size={22} color="#566069" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={notifications}
                keyExtractor={(n) => n.id}
                renderItem={({ item }) => (
                  <View style={styles.notifCardItem}>
                    <View style={styles.notifItemHeader}>
                      <Text style={styles.notifItemTitle}>{item.title}</Text>
                      <Text style={styles.notifItemTime}>{item.time || item.createdAt}</Text>
                    </View>
                    <Text style={styles.notifItemMsg}>{item.message}</Text>
                  </View>
                )}
                contentContainerStyle={styles.notifListContent}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // =========================================================================
  // RENDER: EMPLOYEE DASHBOARD (When Role is Employee)
  // =========================================================================
  return (
    <View style={styles.container}>
      {/* Sticky Top Bar Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.userInfoGroup}>
          <View style={styles.initialBadge}>
            <Text style={styles.initialBadgeText}>
              {(user?.name || 'R').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.appTitle}>Attendance</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.position || 'Senior Software Engineer'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.notifBtn} onPress={handleOpenNotifications} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={22} color="#005ea1" />
          {hasUnreadNotif && <View style={styles.notifBadgeDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Main Digital Clock Hero Card */}
        <View style={styles.clockCard}>
          <Text style={styles.dateLabel}>{dateString}</Text>
          <Text style={styles.clockDisplay}>{timeString}</Text>

          <View style={styles.timeScheduleRow}>
            <View style={styles.timeBox}>
              <Text style={styles.timeBoxLabel}>CHECK-IN</Text>
              <Text style={styles.timeBoxValue}>
                {todayRecord?.clockIn ? todayRecord.clockIn : '--:--'}
              </Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeBox}>
              <Text style={styles.timeBoxLabel}>CHECK-OUT</Text>
              <Text style={styles.timeBoxValue}>
                {todayRecord?.clockOut ? todayRecord.clockOut : '--:--'}
              </Text>
            </View>
          </View>

          {/* Action Button: Check In / Check Out */}
          {!hasClockedIn ? (
            <TouchableOpacity
              style={styles.actionPillBtn}
              onPress={() => router.push('/check-in')}
              activeOpacity={0.85}
            >
              <Ionicons name="finger-print-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionPillBtnText}>Absen Masuk Sekarang</Text>
            </TouchableOpacity>
          ) : !hasClockedOut ? (
            <TouchableOpacity
              style={[styles.actionPillBtn, styles.checkOutBtn]}
              onPress={() => router.push('/check-in?mode=check-out')}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionPillBtnText}>Absen Pulang Sekarang</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.actionPillBtn, styles.completedBtn]}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionPillBtnText}>Absensi Selesai</Text>
            </View>
          )}
        </View>

        {/* 2-Column Bento Grid Stats */}
        <View style={styles.bentoGrid}>
          {/* Card 1: Hadir (Bulan Ini) */}
          <View style={styles.bentoCard}>
            <View style={styles.bentoHeader}>
              <Text style={styles.bentoLabel}>Hadir (Bln Ini)</Text>
              <Ionicons name="calendar-outline" size={18} color="#005ea1" />
            </View>
            <Text style={styles.bentoValue}>{summary?.presentThisMonth ?? 18}</Text>
          </View>

          {/* Card 2: Terlambat */}
          <View style={styles.bentoCard}>
            <View style={styles.bentoHeader}>
              <Text style={styles.bentoLabel}>Terlambat</Text>
              <Ionicons name="alert-circle-outline" size={18} color="#BA1A1A" />
            </View>
            <Text style={[styles.bentoValue, { color: '#BA1A1A' }]}>
              {summary?.lateThisMonth ?? 2}
            </Text>
          </View>

          {/* Card 3: Sisa Cuti */}
          <View style={styles.bentoCard}>
            <View style={styles.bentoHeader}>
              <Text style={styles.bentoLabel}>Sisa Cuti</Text>
              <Ionicons name="time-outline" size={18} color="#005ea1" />
            </View>
            <Text style={styles.bentoValue}>
              {summary?.leaveRemaining ?? 8} <Text style={styles.unitText}>Hari</Text>
            </Text>
          </View>

          {/* Card 4: Jam Kerja */}
          <View style={styles.bentoCard}>
            <View style={styles.bentoHeader}>
              <Text style={styles.bentoLabel}>Jam Kerja</Text>
              <Ionicons name="briefcase-outline" size={18} color="#005ea1" />
            </View>
            <Text style={styles.bentoValue}>
              08:00 <Text style={styles.unitText}>- 17:00</Text>
            </Text>
          </View>
        </View>

        {/* Today's Location Info Card */}
        <View style={styles.locationCard}>
          <View style={styles.locCardHeader}>
            <Ionicons name="location-outline" size={20} color="#005ea1" />
            <Text style={styles.locCardTitle}>Lokasi Presensi Anda</Text>
          </View>
          <Text style={styles.locName}>Proxsis HQ - Cyber 2 Tower</Text>
          <Text style={styles.locDetail}>
            Jl. H. R. Rasuna Said No.13, RT.7/RW.2, Kuningan, Jakarta Selatan
          </Text>
        </View>
      </ScrollView>

      {/* Notifications Modal Sheet */}
      <Modal
        visible={notifModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setNotifModalVisible(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Notifikasi</Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <Ionicons name="close" size={22} color="#566069" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={notifications}
              keyExtractor={(n) => n.id}
              renderItem={({ item }) => (
                <View style={styles.notifCardItem}>
                  <View style={styles.notifItemHeader}>
                    <Text style={styles.notifItemTitle}>{item.title}</Text>
                    <Text style={styles.notifItemTime}>{item.time || item.createdAt}</Text>
                  </View>
                  <Text style={styles.notifItemMsg}>{item.message}</Text>
                </View>
              )}
              contentContainerStyle={styles.notifListContent}
            />
          </View>
        </TouchableOpacity>
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
  headerTitleGroup: {
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
  userInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  initialBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2b78bf',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialBadgeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#005ea1',
  },
  roleBadge: {
    backgroundColor: '#d9e3f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#414751',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    position: 'relative',
  },
  notifBadgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BA1A1A',
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
    backgroundColor: '#005ea1',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#005ea1',
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
  clockCard: {
    backgroundColor: '#005ea1',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#005ea1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  dateLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  clockDisplay: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    marginVertical: 12,
  },
  timeScheduleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  timeBox: {
    alignItems: 'center',
  },
  timeBoxLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '700',
  },
  timeBoxValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  timeDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2b78bf',
    width: '100%',
    height: 48,
    borderRadius: 50,
  },
  checkOutBtn: {
    backgroundColor: '#BA1A1A',
  },
  completedBtn: {
    backgroundColor: '#16A34A',
  },
  actionPillBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bentoCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bentoLabel: {
    fontSize: 12,
    color: '#566069',
    fontWeight: '500',
  },
  bentoValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#121C2C',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#566069',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  locCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  locCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#121C2C',
  },
  locName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#005ea1',
    marginBottom: 2,
  },
  locDetail: {
    fontSize: 12,
    color: '#566069',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#121C2C',
  },
  notifListContent: {
    gap: 12,
  },
  notifCardItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#121C2C',
  },
  notifItemTime: {
    fontSize: 11,
    color: '#717782',
  },
  notifItemMsg: {
    fontSize: 12,
    color: '#414751',
  },
});
