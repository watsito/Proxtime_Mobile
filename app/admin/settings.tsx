import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adminService } from '../../src/services/adminService';
import { CompanySettings } from '../../src/types';

const SETTINGS_CATEGORIES = [
  { id: 'umum', label: 'Umum', icon: 'business-outline' },
  { id: 'absensi', label: 'Absensi', icon: 'time-outline' },
  { id: 'notifikasi', label: 'Notifikasi', icon: 'notifications-outline' },
  { id: 'keamanan', label: 'Keamanan', icon: 'shield-outline' },
  { id: 'lokasi', label: 'Lokasi', icon: 'location-outline' },
  { id: 'departemen', label: 'Departemen', icon: 'people-outline' },
  { id: 'tampilan', label: 'Tampilan', icon: 'color-palette-outline' },
];

export default function AdminSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('umum');
  const [companyName, setCompanyName] = useState('PT. Maju Sejahtera');
  const [companyEmail, setCompanyEmail] = useState('info@majusejahtera.com');
  const [phone, setPhone] = useState('+62 21 1234 5678');
  const [address, setAddress] = useState('Jl. Sudirman No. 123, Jakarta');
  const [timeZone, setTimeZone] = useState('Asia/Jakarta (WIB)');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminService.getCompanySettings().then((s) => {
      setCompanyName(s.companyName);
      setCompanyEmail(s.companyEmail);
      setPhone(s.phone);
      setAddress(s.address);
      setTimeZone(s.timeZone);
    });
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await adminService.updateCompanySettings({
        companyName,
        companyEmail,
        phone,
        address,
        timeZone,
      });
      Alert.alert('Berhasil', 'Pengaturan umum berhasil disimpan.');
    } catch {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#121C2C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pengaturan</Text>
          <View style={styles.adminPillBadge}>
            <Text style={styles.adminPillBadgeText}>Admin</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Settings Sub-Menu Horizontal Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {SETTINGS_CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setActiveTab(cat.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={isActive ? '#005ea1' : '#566069'}
                />
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Settings Card: Pengaturan Umum */}
        {activeTab === 'umum' && (
          <View style={styles.settingsCard}>
            <Text style={styles.cardMainTitle}>Pengaturan Umum</Text>
            <Text style={styles.cardSubTitle}>Atur informasi dasar perusahaan</Text>

            <View style={styles.formStack}>
              {/* Nama Perusahaan */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Nama Perusahaan</Text>
                <TextInput
                  style={styles.inputBox}
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder="Nama Perusahaan"
                />
              </View>

              {/* Email Perusahaan */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email Perusahaan</Text>
                <TextInput
                  style={styles.inputBox}
                  value={companyEmail}
                  onChangeText={setCompanyEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Email Perusahaan"
                />
              </View>

              {/* Telepon */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Telepon</Text>
                <TextInput
                  style={styles.inputBox}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Telepon Perusahaan"
                />
              </View>

              {/* Alamat */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Alamat</Text>
                <TextInput
                  style={styles.inputBox}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Alamat Perusahaan"
                />
              </View>

              {/* Zona Waktu */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Zona Waktu</Text>
                <View style={styles.dropdownBox}>
                  <TextInput
                    style={[styles.inputBox, { flex: 1, borderBottomWidth: 0 }]}
                    value={timeZone}
                    onChangeText={setTimeZone}
                  />
                  <Ionicons name="chevron-down" size={18} color="#566069" />
                </View>
              </View>

              {/* Submit Pill Button */}
              <TouchableOpacity
                style={styles.submitPillBtn}
                onPress={handleSaveSettings}
                activeOpacity={0.8}
              >
                <Text style={styles.submitPillText}>
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab !== 'umum' && (
          <View style={styles.settingsCard}>
            <Text style={styles.cardMainTitle}>Pengaturan {activeTab.toUpperCase()}</Text>
            <Text style={styles.cardSubTitle}>Modul pengaturan dalam tahap aktif.</Text>
          </View>
        )}
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
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  categoryContainer: {
    gap: 8,
    paddingRight: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#EBF3FE',
    borderColor: '#005ea1',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#566069',
  },
  categoryTextActive: {
    color: '#005ea1',
    fontWeight: '700',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardMainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#121C2C',
  },
  cardSubTitle: {
    fontSize: 12,
    color: '#566069',
    marginTop: 2,
    marginBottom: 20,
  },
  formStack: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
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
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingRight: 14,
  },
  submitPillBtn: {
    backgroundColor: '#005ea1',
    height: 48,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#005ea1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
