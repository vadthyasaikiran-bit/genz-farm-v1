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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { saveAuthSession, getFarmProfile } from '../services/storage';
import { COLORS, SHADOWS } from '../constants/theme';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = params.phone || '9876543210';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    if (code.length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await saveAuthSession({
        phone,
        token: `session-${Date.now()}`,
        loggedInAt: new Date().toISOString(),
      });

      const profile = await getFarmProfile();
      if (!profile) {
        router.replace('/onboarding');
      } else {
        router.replace('/tabs');
      }
    } catch (err: any) {
      setError('Verification failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setOtp('123456');
    handleVerify('123456');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Verification Code</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit security code sent to{' '}
              <Text style={styles.phoneHighlight}>+91 {phone}</Text>
            </Text>
          </View>

          <View style={[styles.card, SHADOWS.md]}>
            <TextInput
              style={styles.otpInput}
              placeholder="• • • • • •"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                if (error) setError('');
              }}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleVerify()}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Verifying...' : 'Confirm & Continue'}
              </Text>
              <Ionicons name="checkmark-circle" size={22} color="#ffffff" style={styles.btnIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickFillLink} onPress={handleQuickFill}>
              <Ionicons name="key-outline" size={18} color={COLORS.primary} />
              <Text style={styles.quickFillLinkText}>Enter Code (123456)</Text>
            </TouchableOpacity>
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
    paddingVertical: 24,
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 6,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderHighlight,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: COLORS.primarySoft,
    borderRadius: 18,
    height: 66,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 12,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: 18,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  btnIcon: {
    marginLeft: 8,
  },
  quickFillLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingVertical: 10,
  },
  quickFillLinkText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
});
