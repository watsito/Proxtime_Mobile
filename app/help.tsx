import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { proxtimeService } from '../src/services/proxtime';
import { FaqItem } from '../src/types';
import { theme } from '../src/theme';

export default function HelpScreen() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  useEffect(() => {
    proxtimeService.getFaqs().then(setFaqs);
  }, []);

  const toggleFaq = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent('Halo HR ProxTime Helpdesk, saya mengalami kendala pada aplikasi absensi.');
    const url = `https://wa.me/6281234567890?text=${message}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Kontak', 'WhatsApp: +62 812-3456-7890 (Helpdesk HR Proxsis)');
    });
  };

  const handleOpenEmail = () => {
    Linking.openURL('mailto:helpdesk.hr@proxsis.com?subject=Bantuan%20Absensi%20ProxTime').catch(() => {
      Alert.alert('Email', 'Email Support: helpdesk.hr@proxsis.com');
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Banner */}
      <View style={styles.bannerCard}>
        <Ionicons name="help-buoy" size={40} color={theme.colors.white} />
        <Text style={styles.bannerTitle}>Pusat Bantuan & Support</Text>
        <Text style={styles.bannerSub}>
          Temukan jawaban atas pertanyaan umum seputar fitur absensi, GPS geofencing, dan perizinan.
        </Text>
      </View>

      {/* Support Channels */}
      <Text style={styles.sectionTitle}>Hubungi Tim HR Helpdesk</Text>
      <View style={styles.contactRow}>
        <TouchableOpacity style={styles.contactCard} onPress={handleOpenWhatsApp}>
          <View style={[styles.contactIconBg, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="logo-whatsapp" size={24} color="#16A34A" />
          </View>
          <Text style={styles.contactTitle}>WhatsApp HR</Text>
          <Text style={styles.contactSub}>Respon Cepat (08:00-17:00)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleOpenEmail}>
          <View style={[styles.contactIconBg, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="mail" size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.contactTitle}>Email Support</Text>
          <Text style={styles.contactSub}>helpdesk.hr@proxsis.com</Text>
        </TouchableOpacity>
      </View>

      {/* FAQ List */}
      <Text style={styles.sectionTitle}>Pertanyaan Yang Sering Diajukan (FAQ)</Text>
      {faqs.map((faq) => {
        const isExpanded = expandedId === faq.id;

        return (
          <View key={faq.id} style={styles.faqCard}>
            <TouchableOpacity style={styles.faqHeader} onPress={() => toggleFaq(faq.id)}>
              <View style={styles.faqTitleGroup}>
                <Text style={styles.faqCategory}>{faq.category}</Text>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
              </View>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            {isExpanded ? (
              <View style={styles.faqAnswerBox}>
                <Text style={styles.faqAnswerText}>{faq.answer}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  bannerCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.card,
  },
  bannerTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: '800',
    color: theme.colors.white,
    marginTop: 8,
  },
  bannerSub: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  contactCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  contactIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: theme.typography.size.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  contactSub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  faqTitleGroup: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  faqCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.accent,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  faqQuestion: {
    fontSize: theme.typography.size.sm,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  faqAnswerBox: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  faqAnswerText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
