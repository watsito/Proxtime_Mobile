import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adminService } from '../../src/services/adminService';
import { EmployeeItem } from '../../src/types';

export default function AdminEmployeeListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await adminService.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Top Bar Header */}
      <View style={[styles.topHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#121C2C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manajemen Karyawan</Text>
          <View style={styles.adminPillBadge}>
            <Text style={styles.adminPillBadgeText}>Admin</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadEmployees} />}
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
                  styles.statusBadge,
                  emp.status === 'active' && styles.statusBadgeActive,
                  emp.status === 'wfh' && styles.statusBadgeWfh,
                  emp.status === 'inactive' && styles.statusBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
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
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#121C2C',
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
  statusBadge: {
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
  statusText: {
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
});
