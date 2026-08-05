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
import { useAuth } from '../src/providers/AuthProvider';

export default function PersonalInfoScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form State
  const [name, setName] = useState(user?.name || 'Raihan Arianto');
  const [email, setEmail] = useState(user?.email || 'raihan.arianto@proxsis.com');
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
      Alert.alert('Berhasil', 'Perubahan informasi pribadi berhasil disimpan.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    }, 600);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#121C2C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Informasi Pribadi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={22} color="#005ea1" />
            <Text style={styles.cardHeaderTitle}>Edit Profil Saya</Text>
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#005ea1',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 14,
    marginBottom: 18,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#121C2C',
  },
  formContent: {
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
    fontWeight: '700',
  },
});
