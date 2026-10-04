import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getAuthSession, getFarmProfile } from '../services/storage';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function checkNavigation() {
      try {
        const session = await getAuthSession();
        const profile = await getFarmProfile();

        const inAuthGroup = segments[0] === 'login' || segments[0] === 'otp';
        const inOnboarding = segments[0] === 'onboarding';

        if (!session) {
          if (!inAuthGroup) {
            router.replace('/login');
          }
        } else if (!profile) {
          if (!inOnboarding) {
            router.replace('/onboarding');
          }
        } else {
          if (inAuthGroup || inOnboarding) {
            router.replace('/tabs');
          }
        }
      } catch (err) {
        console.error('Navigation check error:', err);
      } finally {
        setIsReady(true);
      }
    }

    checkNavigation();
  }, [segments]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading GenZ Farm...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="otp" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="tabs" options={{ animation: 'fade' }} />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
