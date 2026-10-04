import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FarmProfile, AuthSession } from '../../services/types';
import { getFarmProfile, getAuthSession, clearAuthSession } from '../../services/storage';
import { COLORS, SHADOWS } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<FarmProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    async function loadData() {
      const p = await getFarmProfile();
      setProfile(p);
      const s = await getAuthSession();
      setSession(s);
    }
    loadData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Farmer Logout',
      'Are you sure you want to log out? Your saved Farm Profile and plans will be safely preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await clearAuthSession();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const aiMode = process.env.EXPO_PUBLIC_AI_MODE || 'demo';
  const aiModel = process.env.EXPO_PUBLIC_AI_MODEL || 'Gemini Pro Agronomy';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.profileCard, SHADOWS.sm]}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={38} color={COLORS.primary} />
          </View>
          <Text style={styles.userName}>{profile?.name || 'Farmer Account'}</Text>
          <Text style={styles.userPhone}>+91 {session?.phone || '9876543210'}</Text>
          <View style={styles.sessionPill}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
            <Text style={styles.sessionPillText}>Verified Mobile Session</Text>
          </View>
        </View>

        {/* Farm Profile Summary */}
        <View style={[styles.card, SHADOWS.sm]}>
          <View style={styles.cardHeader}>
            <Ionicons name="leaf" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Farm Snapshot</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoVal}>
              {profile?.village}, {profile?.district}, {profile?.state}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Verified GPS:</Text>
            <Text style={styles.infoVal}>
              {profile?.latitude}, {profile?.longitude}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Land & Soil:</Text>
            <Text style={styles.infoVal}>
              {profile?.land} • {profile?.soil}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Irrigation:</Text>
            <Text style={styles.infoVal}>{profile?.irrigation}</Text>
          </View>

          <TouchableOpacity
            style={styles.editFarmBtn}
            onPress={() => router.push('/tabs/farm')}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            <Text style={styles.editFarmBtnText}>Edit Complete Farm Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Intelligence Engine Information */}
        <View style={[styles.card, SHADOWS.sm]}>
          <View style={styles.cardHeader}>
            <Ionicons name="server" size={20} color={COLORS.info} />
            <Text style={styles.cardTitle}>System & Agronomic Engine</Text>
          </View>

          <View style={styles.modeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modeLabel}>Agronomic AI Engine</Text>
              <Text style={styles.modeSub}>{aiMode === 'live' ? `Live Model: ${aiModel}` : 'Condition-First Agronomy Model'}</Text>
            </View>
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeText}>ACTIVE</Text>
            </View>
          </View>

          <View style={styles.modeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modeLabel}>Mandi Market Registry</Text>
              <Text style={styles.modeSub}>National APMC Price Index</Text>
            </View>
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeText}>CONNECTED</Text>
            </View>
          </View>

          <View style={styles.modeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modeLabel}>Weather Integration</Text>
              <Text style={styles.modeSub}>Open-Meteo Verified GPS Station</Text>
            </View>
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeText}>VERIFIED</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Log Out (Preserves Farm Profile)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 48,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.borderHighlight,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  userPhone: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 10,
  },
  sessionPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.success,
    marginLeft: 6,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 14.5,
    color: COLORS.text,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  editFarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
  },
  editFarmBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  modeLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.text,
  },
  modeSub: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modeBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 6,
    marginBottom: 20,
  },
  logoutBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: COLORS.danger,
  },
});
