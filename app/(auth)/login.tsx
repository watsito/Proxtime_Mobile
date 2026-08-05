import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/providers/AuthProvider';
import { Wordmark } from '../../src/components/Wordmark';
import { theme } from '../../src/theme';

export default function LoginScreen() {
  const [nikOrEmail, setNikOrEmail] = useState('PX-2026-0891');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!nikOrEmail.trim()) {
      Alert.alert('Peringatan', 'Harap masukkan Alamat E-Mail atau NIK Anda.');
      return;
    }
    if (!password) {
      Alert.alert('Peringatan', 'Harap masukkan Kata Sandi Anda.');
      return;
    }

    setSubmitting(true);
    try {
      await login(nikOrEmail, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Gagal Log In', err.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Outer Card Container */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {/* Header Branding */}
            <View style={styles.brandingHeader}>
              <Wordmark size="md" />
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>Masuk ke ProxTime</Text>
            <Text style={styles.subtitle}>Silakan masuk ke akun ProxTime Anda</Text>

            {/* Email / NIK Input (Underline Style) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ALAMAT E-MAIL</Text>
              <View style={styles.underlineInputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nama@perusahaan.com"
                  placeholderTextColor="#94A3B8"
                  value={nikOrEmail}
                  onChangeText={setNikOrEmail}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input (Underline Style) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>KATA SANDI</Text>
              <View style={styles.underlineInputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Minimal 8 karakter"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Options Row: Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberGroup}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={rememberMe ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={rememberMe ? '#2563EB' : '#94A3B8'}
                />
                <Text style={styles.rememberText}>Ingat Saya</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => Alert.alert('Lupa Password', 'Silakan hubungi HR atau IT Admin Proxsis.')}>
                <Text style={styles.forgotText}>Lupa Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Action Button: Masuk ke Akun */}
            <TouchableOpacity
              style={[styles.primaryBtn, submitting && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>
                {submitting ? 'Memproses...' : 'Masuk ke Akun'}
              </Text>
            </TouchableOpacity>

            {/* Secondary Action Button: Daftar Akun Baru */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => Alert.alert('Info', 'Pendaftaran akun pegawai dilakukan melalui Tim HR Proxsis.')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>Daftar Akun Baru</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Hint Banner */}
        <View style={styles.demoBanner}>
          <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
          <Text style={styles.demoBannerText}>
            Akun Demo: <Text style={{ fontWeight: '700' }}>PX-2026-0891</Text> | Pass: <Text style={{ fontWeight: '700' }}>123456</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF3FE',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    backgroundColor: '#DBEAFE',
    borderRadius: 28,
    padding: 6,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  brandingHeader: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 28,
  },
  fieldGroup: {
    marginBottom: 22,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  underlineInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 2,
  },
  eyeBtn: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 32,
  },
  rememberGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '700',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    backgroundColor: 'rgba(219, 234, 254, 0.6)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  demoBannerText: {
    fontSize: 12,
    color: '#1E40AF',
  },
});
