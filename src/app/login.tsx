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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = (customPhone?: string) => {
    const rawNumber = customPhone !== undefined ? customPhone : phone;
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

    if (cleanNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    router.push({
      pathname: '/otp',
      params: { phone: cleanNumber },
    });
  };

  const handleQuickLogin = () => {
    const samplePhone = '9876543210';
    setPhone(samplePhone);
    handleSendOtp(samplePhone);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header & Logo */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="leaf" size={44} color={COLORS.primary} />
            </View>
            <Text style={styles.appTitle}>GenZ Farm</Text>
            <Text style={styles.tagline}>Intelligent Farming Assistant</Text>
            <Text style={styles.subtext}>
              Condition-first crop planning, verified weather alerts, and smart market selling decisions.
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, SHADOWS.md]}>
            <Text style={styles.cardTitle}>Farmer Login</Text>
            <Text style={styles.cardSubtitle}>
              Enter your mobile number to receive your login verification code.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (error) setError('');
                }}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={() => handleSendOtp()}>
              <Text style={styles.primaryButtonText}>Get Verification Code</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" style={styles.btnIcon} />
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>QUICK ACCESS</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.sampleButton} onPress={handleQuickLogin}>
              <Ionicons name="flash-outline" size={20} color={COLORS.primary} />
              <Text style={styles.sampleButtonText}>Continue with Sample Account</Text>
            </TouchableOpacity>
          </View>

          {/* Value Banner */}
          <View style={styles.banner}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
            <Text style={styles.bannerText}>
              Built from your farm's unique soil, water, and verified evidence. You never need to guess the crop first.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: COLORS.borderHighlight,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 6,
  },
  subtext: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 21,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    height: 58,
    marginBottom: 12,
  },
  countryCode: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1.5,
    borderRightColor: COLORS.border,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: COLORS.text,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  btnIcon: {
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    paddingHorizontal: 12,
    letterSpacing: 0.8,
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
  },
  sampleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    borderRadius: 18,
    padding: 18,
    marginTop: 26,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
