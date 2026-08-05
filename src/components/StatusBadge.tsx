import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { AttendanceStatus, LeaveStatus } from '../types';

interface StatusBadgeProps {
  status: AttendanceStatus | LeaveStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bgColor = theme.colors.successBg;
  let textColor = theme.colors.success;
  let label = status;

  switch (status) {
    case 'HADIR':
    case 'DISETUJUI':
      bgColor = theme.colors.successBg;
      textColor = theme.colors.success;
      label = status === 'HADIR' ? 'Hadir' : 'Disetujui';
      break;
    case 'TERLAMBAT':
    case 'PENDING':
      bgColor = theme.colors.warningBg;
      textColor = theme.colors.warning;
      label = status === 'TERLAMBAT' ? 'Terlambat' : 'Pending';
      break;
    case 'ALPHA':
    case 'DITOLAK':
      bgColor = theme.colors.dangerBg;
      textColor = theme.colors.danger;
      label = status === 'ALPHA' ? 'Alpha' : 'Ditolak';
      break;
    case 'CUTI':
    case 'IZIN':
      bgColor = '#E0F2FE';
      textColor = '#0284C7';
      label = status === 'CUTI' ? 'Cuti' : 'Izin';
      break;
  }

  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, isSmall && styles.badgeSm]}>
      <Text style={[styles.text, { color: textColor }, isSmall && styles.textSm]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: theme.typography.size.xs,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 10,
  },
});
