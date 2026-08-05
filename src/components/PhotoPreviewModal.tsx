import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { AttendanceRecord } from '../types';
import { StatusBadge } from './StatusBadge';

interface PhotoPreviewModalProps {
  visible: boolean;
  record: AttendanceRecord | null;
  onClose: () => void;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({ visible, record, onClose }) => {
  if (!record) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.dateText}>{record.dayName}</Text>
              <Text style={styles.subtitle}>Bukti Absensi & Preview Foto</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Selfie Image */}
            {record.photoUrl ? (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: record.photoUrl }} style={styles.selfieImage} resizeMode="cover" />
                <View style={styles.imageOverlayBadge}>
                  <StatusBadge status={record.status} />
                </View>
              </View>
            ) : (
              <View style={[styles.imageWrapper, styles.noPhotoWrapper]}>
                <Ionicons name="camera-outline" size={48} color={theme.colors.textLight} />
                <Text style={styles.noPhotoText}>Foto tidak tersedia</Text>
              </View>
            )}

            {/* Attendance Details Grid */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Jam Masuk</Text>
                  <Text style={styles.infoValue}>{record.clockIn}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Jam Pulang</Text>
                  <Text style={styles.infoValue}>{record.clockOut || 'Belum Absen'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color={theme.colors.accent} style={styles.locationIcon} />
                <View style={styles.locationTextWrapper}>
                  <Text style={styles.infoLabel}>Lokasi Terverifikasi</Text>
                  <Text style={styles.locationValue}>{record.locationName}</Text>
                  <Text style={styles.coordsText}>
                    GPS: {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>

              {record.notes ? (
                <>
                  <View style={styles.divider} />
                  <View style={styles.notesRow}>
                    <Ionicons name="document-text-outline" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.notesText}>{record.notes}</Text>
                  </View>
                </>
              ) : null}
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Tutup Preview</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg * 1.5,
    borderTopRightRadius: theme.borderRadius.lg * 1.5,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dateText: {
    fontSize: theme.typography.size.lg,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
  },
  scrollBody: {
    paddingBottom: theme.spacing.md,
  },
  imageWrapper: {
    width: '100%',
    height: 240,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  noPhotoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  noPhotoText: {
    marginTop: 8,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.sm,
  },
  selfieImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  infoCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: theme.typography.size.md,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  locationTextWrapper: {
    flex: 1,
  },
  locationValue: {
    fontSize: theme.typography.size.sm,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  coordsText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notesText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  doneBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  doneBtnText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: theme.typography.size.md,
  },
});
