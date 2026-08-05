import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  iconName,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  let bgColor = theme.colors.primary;
  let textColor = theme.colors.white;
  let borderColor = 'transparent';

  switch (variant) {
    case 'secondary':
      bgColor = theme.colors.accent;
      break;
    case 'outline':
      bgColor = 'transparent';
      textColor = theme.colors.primary;
      borderColor = theme.colors.primary;
      break;
    case 'danger':
      bgColor = theme.colors.danger;
      break;
    case 'success':
      bgColor = theme.colors.success;
      break;
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColor, borderColor },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {iconName ? (
            <Ionicons name={iconName} size={20} color={textColor} style={styles.icon} />
          ) : null}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.button,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: theme.typography.size.md,
    fontWeight: '700',
  },
});
