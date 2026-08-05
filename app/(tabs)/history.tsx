import React, { useState, useCallback, useMemo } from 'react';
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
  ListRenderItemInfo,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { proxtimeService } from '../../src/services/proxtime';
import { AttendanceRecord } from '../../src/types';
import { PhotoPreviewModal } from '../../src/components/PhotoPreviewModal';

const MONTH_OPTIONS = [
  { id: 'ALL', label: 'Semua Bulan' },
  { id: '2026-08', label: 'Bulan Ini (Agustus 2026)' },
  { id: '2026-07', label: 'Juli 2026' },
  { id: '2026-06', label: 'Juni 2026' },
];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const records = await proxtimeService.getAttendanceHistory();
      setHistory(records);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  // Active month label for button
  const currentMonthLabel = useMemo(() => {
    const found = MONTH_OPTIONS.find((m) => m.id === selectedMonth);
    return found ? found.label : 'Pilih Bulan';
  }, [selectedMonth]);

  // Filter history by search query AND selected month
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // 1. Month Filter
      if (selectedMonth !== 'ALL') {
        const itemDateStr = item.date; // e.g. "2026-08-04"
        if (!itemDateStr.startsWith(selectedMonth)) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchLocation = item.locationName.toLowerCase().includes(q);
        const matchStatus = item.status.toLowerCase().includes(q);
        const matchDay = item.dayName.toLowerCase().includes(q);
        const matchDate = item.date.includes(q);
        return matchLocation || matchStatus || matchDay || matchDate;
      }

      return true;
    });
  }, [history, searchQuery, selectedMonth]);

  const handleOpenPreview = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const renderItem = ({ item }: ListRenderItemInfo<AttendanceRecord>) => {
    const isLate = item.status === 'TERLAMBAT';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleOpenPreview(item)}
        activeOpacity={0.85}
      >
        {/* Card Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.userGroup}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:
                    item.photoUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                }}
                style={styles.avatarImg}
              />
            </View>
            <Text style={styles.dateTitle}>{item.dayName}</Text>
          </View>

          {/* Status Badge Pill */}
          <View style={[styles.statusPill, isLate ? styles.statusPillLate : styles.statusPillPresent]}>
            <Text style={[styles.statusPillText, isLate ? styles.statusTextLate : styles.statusTextPresent]}>
              {isLate ? 'TERLAMBAT 15m' : item.status}
            </Text>
          </View>
        </View>

        {/* Check-in / Check-out Grid */}
        <View style={styles.gridRow}>
          {/* Check-in */}
          <View style={styles.gridCol}>
            <Text style={styles.gridLabel}>CHECK-IN</Text>
            <View style={styles.timeGroup}>
              <Ionicons
                name="log-in-outline"
                size={20}
                color={isLate ? '#BA1A1A' : '#005ea1'}
              />
              <Text style={styles.timeText}>{item.clockIn}</Text>
            </View>
          </View>

          {/* Check-out */}
          <View style={styles.gridCol}>
            <Text style={styles.gridLabel}>CHECK-OUT</Text>
            <View style={styles.timeGroup}>
              <Ionicons name="log-out-outline" size={20} color="#717782" />
              <Text style={styles.timeText}>{item.clockOut || '05:00 PM'}</Text>
            </View>
          </View>
        </View>

        {/* Location Footer Line */}
        <View style={styles.locationFooter}>
          <Ionicons name="location-outline" size={16} color="#414751" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.locationName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 },
        ]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadHistory} />}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Page Title & Subtitle */}
            <Text style={styles.pageTitle}>Riwayat Absensi Saya</Text>
            <Text style={styles.pageSubtitle}>Pantau riwayat check-in dan check-out Anda</Text>

            {/* Filter Inputs Group */}
            <View style={styles.filterGroup}>
              {/* Search Bar Input */}
              <View style={styles.searchWrapper}>
                <Ionicons name="search-outline" size={18} color="#717782" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari lokasi atau status..."
                  placeholderTextColor="#717782"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                    <Ionicons name="close-circle" size={18} color="#717782" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Month Selector Button */}
              <TouchableOpacity
                style={styles.monthSelectorBtn}
                activeOpacity={0.8}
                onPress={() => setMonthModalVisible(true)}
              >
                <Text style={styles.monthSelectorText}>{currentMonthLabel}</Text>
                <Ionicons name="calendar-outline" size={20} color="#005ea1" />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-clear-outline" size={48} color="#717782" />
            <Text style={styles.emptyText}>Tidak ada riwayat absensi ditemukan</Text>
          </View>
        }
      />

      {/* Month Picker Selection Modal */}
      <Modal
        visible={monthModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMonthModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMonthModalVisible(false)}
        >
          <View style={styles.monthModalCard}>
            <View style={styles.monthModalHeader}>
              <Text style={styles.monthModalTitle}>Pilih Periode Bulan</Text>
              <TouchableOpacity onPress={() => setMonthModalVisible(false)}>
                <Ionicons name="close" size={22} color="#414751" />
              </TouchableOpacity>
            </View>

            {MONTH_OPTIONS.map((option) => {
              const isSelected = selectedMonth === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.monthOptionItem, isSelected && styles.monthOptionSelected]}
                  onPress={() => {
                    setSelectedMonth(option.id);
                    setMonthModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.monthOptionText, isSelected && styles.monthOptionTextSelected]}>
                    {option.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color="#005ea1" />}
                </TouchableOpacity>
              );
            })}
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
    backgroundColor: '#F0F7FF',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  headerSection: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#121C2C',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#414751',
    marginBottom: 20,
  },
  filterGroup: {
    gap: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f3ff',
    borderRadius: 50,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#121C2C',
  },
  clearSearchBtn: {
    padding: 4,
  },
  monthSelectorBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f3ff',
    borderRadius: 50,
    paddingHorizontal: 20,
    height: 48,
  },
  monthSelectorText: {
    fontSize: 14,
    color: '#414751',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#c1c7d2',
    backgroundColor: '#d9e3f9',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121C2C',
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
  },
  statusPillPresent: {
    backgroundColor: '#E6F4EA',
  },
  statusPillLate: {
    backgroundColor: '#FFDAD6',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusTextPresent: {
    color: '#1E8E3E',
  },
  statusTextLate: {
    color: '#93000A',
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  gridCol: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#414751',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  timeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#121C2C',
  },
  locationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d9e3f9',
  },
  locationText: {
    fontSize: 14,
    color: '#414751',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#717782',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  monthModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
    gap: 8,
  },
  monthModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  monthModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121C2C',
  },
  monthOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  monthOptionSelected: {
    backgroundColor: '#EBF3FE',
    borderWidth: 1,
    borderColor: '#005ea1',
  },
  monthOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#414751',
  },
  monthOptionTextSelected: {
    color: '#005ea1',
    fontWeight: '700',
  },
});
