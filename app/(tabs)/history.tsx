import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Image,
  Modal,
  ScrollView,
  ListRenderItemInfo,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/providers/AuthProvider';
import { proxtimeService } from '../../src/services/proxtime';
import { adminService } from '../../src/services/adminService';
import { AttendanceRecord, EmployeeItem } from '../../src/types';
import { PhotoPreviewModal } from '../../src/components/PhotoPreviewModal';

const MONTH_OPTIONS = [
  { id: 'ALL', label: 'Semua Bulan' },
  { id: '2026-08', label: 'Bulan Ini (Agustus 2026)' },
  { id: '2026-07', label: 'Juli 2026' },
  { id: '2026-06', label: 'Juni 2026' },
];

export default function HistoryScreen() {
  const { isAdmin } = useAuth();
  const insets = useSafeAreaInsets();

  // Employee State
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Admin State
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const loadData = async () => {
    try {
      if (isAdmin) {
        setAdminLoading(true);
        const emps = await adminService.getEmployees();
        setEmployees(emps);
        setAdminLoading(false);
      } else {
        setLoading(true);
        const records = await proxtimeService.getAttendanceHistory();
        setHistory(records);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading history screen data:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [isAdmin])
  );

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.locationName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMonth =
        selectedMonth === 'ALL' || item.date.startsWith(selectedMonth);

      return matchesSearch && matchesMonth;
    });
  }, [history, searchQuery, selectedMonth]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  // =========================================================================
  // RENDER: ADMIN VIEW (Direktori Karyawan)
  // =========================================================================
  if (isAdmin) {
    return (
      <View style={styles.container}>
        {/* Top Header */}
        <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Manajemen Karyawan</Text>
            <View style={styles.adminPillBadge}>
              <Text style={styles.adminPillBadgeText}>Admin</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={<RefreshControl refreshing={adminLoading} onRefresh={loadData} />}
        >
          {/* Search Bar Input */}
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={18} color="#717782" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama, posisi, atau departemen..."
              placeholderTextColor="#717782"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Text style={styles.sectionTitle}>
            Daftar Karyawan ({filteredEmployees.length})
          </Text>

          {filteredEmployees.map((emp) => (
            <View key={emp.id} style={styles.employeeCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.avatarWrapper}>
                  <Text style={styles.avatarText}>{emp.avatarInitial}</Text>
                </View>

                <View style={styles.empInfo}>
                  <Text style={styles.empName}>{emp.name}</Text>
                  <Text style={styles.empPosition}>{emp.position}</Text>
                  <Text style={styles.empDept}>{emp.department}</Text>
                </View>

                <View
                  style={[
                    styles.empStatusBadge,
                    emp.status === 'active' && styles.statusBadgeActive,
                    emp.status === 'wfh' && styles.statusBadgeWfh,
                    emp.status === 'inactive' && styles.statusBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.empStatusText,
                      emp.status === 'active' && styles.statusTextActive,
                      emp.status === 'wfh' && styles.statusTextWfh,
                      emp.status === 'inactive' && styles.statusTextInactive,
                    ]}
                  >
                    {emp.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.contactRow}>
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={14} color="#566069" />
                  <Text style={styles.contactText}>{emp.email}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={14} color="#566069" />
                  <Text style={styles.contactText}>{emp.phone}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // RENDER: EMPLOYEE VIEW (Riwayat Absensi)
  // =========================================================================
  const renderHistoryItem = ({ item }: ListRenderItemInfo<AttendanceRecord>) => {
    const isPresent = item.status === 'HADIR';
    const isLate = item.status === 'TERLAMBAT';

    return (
      <View style={styles.recordCard}>
        <View style={styles.cardHeader}>
          <View style={styles.dateGroup}>
            <Text style={styles.dayText}>{item.dayName}</Text>
            <Text style={styles.dateSubText}>{item.date}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isPresent && styles.statusPresent,
              isLate && styles.statusLate,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isPresent && styles.statusTextPresent,
                isLate && styles.statusTextLate,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.timeGrid}>
          <View style={styles.timeCol}>
            <Text style={styles.timeColLabel}>Jam Masuk</Text>
            <Text style={styles.timeColValue}>{item.clockIn}</Text>
          </View>
          <View style={styles.timeColDivider} />
          <View style={styles.timeCol}>
            <Text style={styles.timeColLabel}>Jam Pulang</Text>
            <Text style={styles.timeColValue}>{item.clockOut || '--:--'}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.locationInfo}>
            <Ionicons name="location-outline" size={14} color="#566069" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.locationName}
            </Text>
          </View>
          {item.photoUrl && (
            <TouchableOpacity
              style={styles.photoBtn}
              onPress={() => {
                setSelectedRecord(item);
                setModalVisible(true);
              }}
            >
              <Ionicons name="image-outline" size={14} color="#005ea1" />
              <Text style={styles.photoBtnText}>Foto</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Riwayat Absensi</Text>
      </View>

      {/* Filter Row: Search & Month Select */}
      <View style={styles.filterBar}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color="#717782" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari tanggal, status, atau lokasi..."
            placeholderTextColor="#717782"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.monthSelectBtn}
          onPress={() => setMonthModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={18} color="#005ea1" />
          <Text style={styles.monthSelectText}>
            {MONTH_OPTIONS.find((m) => m.id === selectedMonth)?.label.split(' ')[0] || 'Filter'}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#005ea1" />
        </TouchableOpacity>
      </View>

      {/* FlatList Riwayat Absensi */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
      />

      {/* Month Selection Modal */}
      <Modal
        visible={monthModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMonthModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMonthModalVisible(false)}
        >
          <View style={styles.monthModalSheet}>
            <View style={styles.modalIndicator} />
            <Text style={styles.monthModalTitle}>Pilih Bulan Absensi</Text>

            {MONTH_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.monthOptionRow,
                  selectedMonth === m.id && styles.monthOptionActive,
                ]}
                onPress={() => {
                  setSelectedMonth(m.id);
                  setMonthModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.monthOptionText,
                    selectedMonth === m.id && styles.monthOptionTextActive,
                  ]}
                >
                  {m.label}
                </Text>
                {selectedMonth === m.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#005ea1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Photo Preview Modal */}
      <PhotoPreviewModal
        visible={modalVisible}
        record={selectedRecord}
        onClose={() => setModalVisible(false)}
      />
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
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 10,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#121C2C',
  },
  monthSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EBF3FE',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#005ea1',
  },
  monthSelectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#005ea1',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateGroup: {
    gap: 2,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#121C2C',
  },
  dateSubText: {
    fontSize: 12,
    color: '#566069',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  statusPresent: {
    backgroundColor: '#E6F4EA',
  },
  statusLate: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextPresent: {
    color: '#1E8E3E',
  },
  statusTextLate: {
    color: '#D97706',
  },
  timeGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  timeCol: {
    flex: 1,
    alignItems: 'center',
  },
  timeColDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  timeColLabel: {
    fontSize: 11,
    color: '#566069',
  },
  timeColValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121C2C',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#566069',
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  photoBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#005ea1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121C2C',
  },
  employeeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF3FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#005ea1',
  },
  empInfo: {
    flex: 1,
  },
  empName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#121C2C',
  },
  empPosition: {
    fontSize: 12,
    fontWeight: '600',
    color: '#005ea1',
    marginTop: 2,
  },
  empDept: {
    fontSize: 11,
    color: '#566069',
  },
  empStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  statusBadgeActive: {
    backgroundColor: '#E6F4EA',
  },
  statusBadgeWfh: {
    backgroundColor: '#E0F2FE',
  },
  statusBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  empStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#1E8E3E',
  },
  statusTextWfh: {
    color: '#0284C7',
  },
  statusTextInactive: {
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 11,
    color: '#566069',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  monthModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  monthModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121C2C',
    marginBottom: 8,
  },
  monthOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  monthOptionActive: {
    backgroundColor: '#EBF3FE',
  },
  monthOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#566069',
  },
  monthOptionTextActive: {
    color: '#005ea1',
    fontWeight: '700',
  },
});
