import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

export const Wordmark: React.FC<WordmarkProps> = ({ size = 'md', subtitle = 'Attendance Management System' }) => {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <View style={styles.container}>
      <View style={styles.badgeContainer}>
        <Text style={[styles.brandText, isLarge && styles.brandTextLg, isSmall && styles.brandTextSm]}>
          Prox<Text style={styles.brandAccent}>Time</Text>
        </Text>
        <View style={styles.taglineBadge}>
          <Text style={styles.taglineText}>BY PROXSIS</Text>
        </View>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  brandText: {
    fontSize: theme.typography.size.title,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  brandTextLg: {
    fontSize: 36,
  },
  brandTextSm: {
    fontSize: 20,
  },
  brandAccent: {
    color: theme.colors.accent,
  },
  taglineBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  taglineText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});
