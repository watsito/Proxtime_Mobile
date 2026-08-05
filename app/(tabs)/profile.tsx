import React, { useState } from 'react';
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
import { useAuth } from '../../src/providers/AuthProvider';

export default function ProfileScreen() {
  const { user, currentRole, switchRole, logout, isAdmin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form State
  const [name, setName] = useState(user?.name || 'Muhammad Raihan Ramadhan');
  const [email, setEmail] = useState(user?.email || 'muhammad.ramadhan@proxsis.co.id');
  const [phone, setPhone] = useState('+62 812-3456-7890');
  const [joinDate] = useState('1 Januari 2024');
  const [department, setDepartment] = useState(user?.department || 'Technology & Digital Innovation');
  const [position, setPosition] = useState(user?.position || 'Senior Software Engineer');
  const [address, setAddress] = useState('Jl. Sudirman No. 123, Jakarta Selatan');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Berhasil', 'Perubahan informasi profil berhasil disimpan.');
    }, 600);
  };

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun ProxTime?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const firstLetter = (name || 'M').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 90 },
        ]}
      >
        {/* Profile Header Card */}
        <View style={styles.card}>
          {/* Banner Header Gradient */}
          <View style={styles.bannerGradient}>
            <TouchableOpacity style={styles.editBannerBtn} onPress={handleSaveProfile}>
              <Ionicons name="create-outline" size={20} color="rgba(255, 255, 255, 0.9)" />
            </TouchableOpacity>
          </View>

          {/* Overlapping Avatar Circle */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{firstLetter}</Text>
            </View>

            {/* Name & Role Pill */}
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{name}</Text>
              <View style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}>
                <Text style={[styles.roleBadgeText, isAdmin && styles.roleBadgeTextAdmin]}>
                  {isAdmin ? 'Admin' : 'Karyawan'}
                </Text>
              </View>
            </View>
            <Text style={styles.userEmail}>{email}</Text>

            {/* GANTI ROLE Switcher Pill Row (Matching Web Screenshot) */}
            <View style={styles.roleSwitcherBox}>
              <Text style={styles.roleSwitcherLabel}>GANTI ROLE</Text>
              <View style={styles.rolePillGroup}>
                <TouchableOpacity
                  style={[styles.rolePillBtn, currentRole === 'employee' && styles.rolePillBtnActive]}
                  onPress={() => switchRole('employee')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={14}
                    color={currentRole === 'employee' ? '#FFFFFF' : '#566069'}
                  />
                  <Text style={[styles.rolePillText, currentRole === 'employee' && styles.rolePillTextActive]}>
                    Karyawan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.rolePillBtn, currentRole === 'admin' && styles.rolePillBtnActive]}
                  onPress={() => switchRole('admin')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={14}
                    color={currentRole === 'admin' ? '#FFFFFF' : '#566069'}
                  />
                  <Text style={[styles.rolePillText, currentRole === 'admin' && styles.rolePillTextActive]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveHeaderBtn}
              onPress={handleSaveProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.saveHeaderBtnText}>{saving ? 'Menyimpan...' : 'Simpan'}</Text>
            </TouchableOpacity>

            {/* Stats Footer Row (3 Columns) */}
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statNumber}>18</Text>
                <Text style={styles.statLabel}>Hadir (Bln Ini)</Text>
              </View>
              <View style={[styles.statCol, styles.statColBorder]}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Terlambat</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statNumber}>8 Hari</Text>
                <Text style={styles.statLabel}>Sisa Cuti</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Panel Kontrol Admin Card (Only when Admin mode is active) */}
        {isAdmin && (
          <View style={[styles.card, styles.adminCard]}>
            <View style={styles.adminCardHeader}>
              <View style={styles.adminTitleRow}>
                <Ionicons name="shield-checkmark" size={20} color="#005ea1" />
                <Text style={styles.adminCardTitle}>Panel Kontrol Admin</Text>
              </View>
              <View style={styles.adminActiveBadge}>
                <Text style={styles.adminActiveBadgeText}>ADMIN ACTIVE</Text>
              </View>
            </View>
            <Text style={styles.adminCardSub}>
              Mode Admin Aktif! Ketuk tombol "Dashboard" di navigasi bawah untuk langsung mengakses Dashboard Admin, feed presensi tim, dan persetujuan cuti.
            </Text>

            <TouchableOpacity
              style={styles.adminEnterBtn}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.85}
            >
              <Ionicons name="apps-outline" size={18} color="#FFFFFF" />
              <Text style={styles.adminEnterBtnText}>Buka Dashboard Admin</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Informasi Pribadi Card */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="person-outline" size={20} color="#005ea1" />
            <Text style={styles.cardTitle}>Informasi Pribadi</Text>
          </View>

          <View style={styles.formContent}>
            {/* Nama Lengkap */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nama Lengkap</Text>
              <TextInput
                style={styles.underlineInput}
                value={name}
                onChangeText={setName}
                placeholder="Nama Lengkap"
              />
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.underlineInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email"
              />
            </View>

            {/* Nomor Telepon */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nomor Telepon</Text>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="call-outline" size={18} color="#566069" style={styles.fieldIcon} />
                <TextInput
                  style={[styles.underlineInput, { flex: 1 }]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Tanggal Bergabung */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Tanggal Bergabung</Text>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="calendar-outline" size={18} color="#566069" style={styles.fieldIcon} />
                <TextInput
                  style={[styles.underlineInput, { flex: 1, color: '#566069' }]}
                  value={joinDate}
                  editable={false}
                />
              </View>
            </View>

            {/* Departemen */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Departemen</Text>
              <TextInput
                style={styles.underlineInput}
                value={department}
                onChangeText={setDepartment}
              />
            </View>

            {/* Posisi */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Posisi</Text>
              <TextInput
                style={styles.underlineInput}
                value={position}
                onChangeText={setPosition}
              />
            </View>

            {/* Alamat */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Alamat</Text>
              <View style={styles.inputIconWrapper}>
                <Ionicons name="location-outline" size={18} color="#566069" style={styles.fieldIcon} />
                <TextInput
                  style={[styles.underlineInput, { flex: 1 }]}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSaveProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Pusat Bantuan & Logout */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/help')}>
            <View style={styles.menuRowLeft}>
              <Ionicons name="help-buoy-outline" size={20} color="#005ea1" />
              <Text style={styles.menuRowText}>Pusat Bantuan & FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#566069" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
            <View style={styles.menuRowLeft}>
              <Ionicons name="log-out-outline" size={20} color="#BA1A1A" />
              <Text style={[styles.menuRowText, { color: '#BA1A1A' }]}>Keluar dari Akun</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#566069" />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>ProxTime Native v1.0.0 • Powered by Proxsis</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bannerGradient: {
    height: 100,
    backgroundColor: '#005ea1',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 16,
  },
  editBannerBtn: {
    padding: 4,
  },
  avatarSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#d9e3f9',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -44,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: '#005ea1',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#121C2C',
  },
  roleBadge: {
    backgroundColor: '#d9e3f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 50,
  },
  roleBadgeAdmin: {
    backgroundColor: '#005ea1',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#414751',
  },
  roleBadgeTextAdmin: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 14,
    color: '#566069',
    marginTop: 2,
    marginBottom: 12,
  },
  roleSwitcherBox: {
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    borderRadius: 16,
    padding: 10,
    width: '100%',
    marginBottom: 16,
  },
  roleSwitcherLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#566069',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  rolePillGroup: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 50,
    padding: 3,
    width: '100%',
  },
  rolePillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 50,
  },
  rolePillBtnActive: {
    backgroundColor: '#005ea1',
    shadowColor: '#005ea1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#566069',
  },
  rolePillTextActive: {
    color: '#FFFFFF',
  },
  saveHeaderBtn: {
    backgroundColor: '#005ea1',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 50,
    marginBottom: 20,
  },
  saveHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#c1c7d2',
    paddingTop: 16,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statColBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#c1c7d2',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#121C2C',
  },
  statLabel: {
    fontSize: 12,
    color: '#566069',
    marginTop: 2,
    textAlign: 'center',
  },
  adminCard: {
    borderWidth: 1.5,
    borderColor: '#005ea1',
    padding: 16,
    backgroundColor: '#F0F7FF',
  },
  adminCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  adminTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#005ea1',
  },
  adminActiveBadge: {
    backgroundColor: '#005ea1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 50,
  },
  adminActiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  adminCardSub: {
    fontSize: 12,
    color: '#566069',
    marginBottom: 14,
  },
  adminEnterBtn: {
    backgroundColor: '#005ea1',
    height: 44,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adminEnterBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 20,
    paddingBottom: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#121C2C',
  },
  formContent: {
    padding: 20,
    gap: 18,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#566069',
    fontWeight: '500',
  },
  underlineInput: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#c1c7d2',
    height: 36,
    fontSize: 14,
    color: '#121C2C',
    paddingVertical: 2,
  },
  inputIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    marginRight: 8,
  },
  submitBtn: {
    backgroundColor: '#005ea1',
    height: 48,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#005ea1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuRowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#121C2C',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 18,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#717782',
    marginTop: 8,
  },
});
