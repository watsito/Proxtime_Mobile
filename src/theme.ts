export const theme = {
  colors: {
    primary: '#1E3A8A',     // ProxTime Navy Blue
    primaryLight: '#3B82F6',
    accent: '#2563EB',       // Action Blue
    success: '#10B981',      // Emerald Green (Hadir / Disetujui)
    successBg: '#D1FAE5',
    warning: '#F59E0B',      // Amber Yellow (Terlambat / Pending)
    warningBg: '#FEF3C7',
    danger: '#EF4444',       // Rose Red (Alpha / Ditolak)
    dangerBg: '#FEE2E2',
    background: '#F8FAFC',   // Light Slate Background
    surface: '#FFFFFF',      // Card White
    border: '#E2E8F0',       // Divider Gray
    textPrimary: '#0F172A',  // Dark slate text
    textSecondary: '#64748B',// Muted text
    textLight: '#94A3B8',    // Subtitle text
    white: '#FFFFFF',
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      title: 28,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    button: {
      shadowColor: '#1E3A8A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};
