import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FarmProfile, FarmPlan, WeatherData } from '../../services/types';
import { getFarmProfile, getFarmPlan } from '../../services/storage';
import { fetchLiveWeather } from '../../services/weather';
import { getTodayTasks } from '../../services/plan';
import { setTaskStatus, submitDailyFeedback } from '../../services/feedback';
import { COLORS, SHADOWS } from '../../constants/theme';

function getWeatherIconName(condition: string = ''): keyof typeof Ionicons.glyphMap {
  const c = condition.toLowerCase();
  if (c.includes('thunder')) return 'thunderstorm';
  if (c.includes('heavy rain') || c.includes('showers')) return 'rainy';
  if (c.includes('rain') || c.includes('drizzle')) return 'rainy-outline';
  if (c.includes('overcast') || c.includes('cloudy')) return 'cloudy';
  if (c.includes('fog')) return 'cloud-outline';
  if (c.includes('clear') || c.includes('sunny')) return 'sunny';
  return 'partly-sunny';
}

function formatDayName(dateStr: string, index: number): string {
  if (index === 0) return 'Today';
  try {
    const parts = dateStr.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  } catch {
    return `Day ${index + 1}`;
  }
}

function formatShortDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
  } catch {
    return dateStr;
  }
}

export default function HomeScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<FarmProfile | null>(null);
  const [plan, setPlan] = useState<FarmPlan | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Daily feedback state
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    try {
      const storedProfile = await getFarmProfile();
      setProfile(storedProfile);

      const storedPlan = await getFarmPlan();
      setPlan(storedPlan);

      if (storedProfile && storedProfile.latitude && storedProfile.longitude) {
        const weatherData = await fetchLiveWeather(
          storedProfile.latitude,
          storedProfile.longitude
        );
        setWeather(weatherData);
      } else {
        setWeather({
          temperature: 0,
          conditionDescription: 'Coordinates Required',
          isUnavailable: true,
          unavailableReason: 'Verified GPS coordinates are needed to display live local weather.',
        });
      }
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleTask = async (taskId: string, newStatus: 'pending' | 'done' | 'skipped') => {
    try {
      const updated = await setTaskStatus(taskId, newStatus);
      if (updated) {
        setPlan(updated);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleSubmitFeedback = async (triggerReplan: boolean = false) => {
    if (!feedbackNotes.trim()) {
      Alert.alert('Field Note Required', 'Please enter your observation or weather update.');
      return;
    }

    setFeedbackSending(true);
    setFeedbackSuccess('');
    try {
      const result = await submitDailyFeedback({
        notes: feedbackNotes.trim(),
        weatherObservation: weather && !weather.isUnavailable ? weather.conditionDescription : undefined,
        triggerReplan,
      });

      if (result.error) {
        Alert.alert('Replanning Notice', result.error);
      } else {
        setFeedbackSuccess(
          triggerReplan
            ? 'Observation recorded and seasonal plan updated!'
            : 'Field observation saved to your log.'
        );
        setFeedbackNotes('');
        if (result.updatedPlan) {
          setPlan(result.updatedPlan);
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit observation');
    } finally {
      setFeedbackSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Syncing your farm dashboard...</Text>
      </View>
    );
  }

  const todayTasks = getTodayTasks(plan, todayStr);
  const hasPlan = Boolean(plan && plan.tasks && plan.tasks.length > 0);
  const todayForecast = weather?.forecast?.[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top Greeting Bar */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>HELLO & WELCOME</Text>
            <Text style={styles.farmerName}>{profile?.name || 'Farmer'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={15} color={COLORS.primary} />
              <Text style={styles.locationText}>
                {profile?.village}, {profile?.district} ({profile?.state})
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.farmSetupBtn}
            onPress={() => router.push('/tabs/farm')}
          >
            <Ionicons name="create-outline" size={16} color={COLORS.primary} />
            <Text style={styles.farmSetupBtnText}>Farm Details</Text>
          </TouchableOpacity>
        </View>

        {/* Farm Profile Summary Chips */}
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Ionicons name="resize" size={14} color={COLORS.primary} />
            <Text style={styles.chipText}>{profile?.land || 'Land area'}</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="layers" size={14} color={COLORS.accent} />
            <Text style={styles.chipText}>{profile?.soil || 'Soil type'}</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="water" size={14} color={COLORS.info} />
            <Text style={styles.chipText}>{profile?.irrigation || 'Irrigation'}</Text>
          </View>
        </View>

        {/* Responsive, Well-Fitted Live Weather & Forecast Card */}
        <View style={[styles.weatherCard, SHADOWS.sm]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWrap}>
              <Ionicons name="partly-sunny" size={22} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Live Verified Weather</Text>
            </View>
            <View
              style={[
                styles.weatherBadge,
                weather?.isUnavailable ? styles.weatherBadgeWarn : styles.weatherBadgeGood,
              ]}
            >
              <Text
                style={[
                  styles.weatherBadgeText,
                  { color: weather?.isUnavailable ? COLORS.warning : COLORS.success },
                ]}
              >
                {weather?.isUnavailable ? 'Unavailable' : 'Live Station'}
              </Text>
            </View>
          </View>

          {weather?.isUnavailable ? (
            <View style={styles.weatherUnavailableBox}>
              <Ionicons name="alert-circle" size={20} color={COLORS.warning} />
              <Text style={styles.weatherUnavailableText}>
                {weather.unavailableReason || 'Weather data unavailable.'}
              </Text>
            </View>
          ) : (
            <View style={styles.weatherBody}>
              {/* Primary Current Weather Row */}
              <View style={styles.currentWeatherHero}>
                <View style={styles.heroLeft}>
                  <Text style={styles.tempHeroText}>{weather?.temperature}°C</Text>
                  <Text style={styles.weatherConditionText}>{weather?.conditionDescription}</Text>
                  {todayForecast ? (
                    <Text style={styles.tempRangeText}>
                      High: {todayForecast.tempMax}°C  •  Low: {todayForecast.tempMin}°C
                    </Text>
                  ) : null}
                </View>

                <View style={styles.heroRightIconWrap}>
                  <Ionicons
                    name={getWeatherIconName(weather?.conditionDescription)}
                    size={46}
                    color={COLORS.primary}
                  />
                </View>
              </View>

              {/* Agricultural Metrics Grid (Equal Flex - Always Fits Cleanly) */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricCell}>
                  <View style={styles.metricIconRow}>
                    <Ionicons name="water-outline" size={16} color={COLORS.info} />
                    <Text style={styles.metricCellLabel}>HUMIDITY</Text>
                  </View>
                  <Text style={styles.metricCellValue}>{weather?.humidity ?? '--'}%</Text>
                </View>

                <View style={styles.metricCell}>
                  <View style={styles.metricIconRow}>
                    <Ionicons name="rainy-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.metricCellLabel}>RAIN PROB.</Text>
                  </View>
                  <Text style={styles.metricCellValue}>{weather?.rainProbability ?? '--'}%</Text>
                </View>

                <View style={styles.metricCell}>
                  <View style={styles.metricIconRow}>
                    <Ionicons name="speedometer-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.metricCellLabel}>WIND</Text>
                  </View>
                  <Text style={styles.metricCellValue}>{weather?.windSpeed ?? '--'} km/h</Text>
                </View>
              </View>

              {/* 7-Day Agricultural Forecast Strip */}
              {weather?.forecast && weather.forecast.length > 0 ? (
                <View style={styles.forecastSection}>
                  <View style={styles.forecastSectionHeader}>
                    <Text style={styles.forecastHeading}>7-Day Field Weather Outlook</Text>
                    <Text style={styles.forecastScrollHint}>Swipe for days →</Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.forecastScrollContainer}
                  >
                    {weather.forecast.map((day, dIdx) => (
                      <View
                        key={day.date}
                        style={[
                          styles.forecastDayCard,
                          dIdx === 0 && styles.forecastDayCardToday,
                        ]}
                      >
                        <Text
                          style={[
                            styles.forecastDayName,
                            dIdx === 0 && { color: COLORS.primary, fontWeight: '800' },
                          ]}
                        >
                          {formatDayName(day.date, dIdx)}
                        </Text>
                        <Text style={styles.forecastDayDate}>{formatShortDate(day.date)}</Text>

                        <View style={styles.forecastIconCircle}>
                          <Ionicons
                            name={getWeatherIconName(day.condition)}
                            size={22}
                            color={dIdx === 0 ? COLORS.primary : COLORS.textSecondary}
                          />
                        </View>

                        <Text style={styles.forecastTempMax}>{day.tempMax}°</Text>
                        <Text style={styles.forecastTempMin}>{day.tempMin}°</Text>

                        <View style={styles.forecastRainRow}>
                          <Ionicons name="water" size={10} color={COLORS.info} />
                          <Text style={styles.forecastRainText}>{day.rainMm}mm</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </View>
          )}
        </View>

        {/* Personal Farm Buddy AI Quick Card */}
        <TouchableOpacity
          style={[styles.aiCompanionCard, SHADOWS.sm]}
          onPress={() => router.push('/tabs/ai')}
        >
          <View style={styles.aiCompanionIcon}>
            <Ionicons name="sparkles" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiCompanionTitle}>Talk with Farm Buddy AI</Text>
            <Text style={styles.aiCompanionDesc}>
              Your personal companion knows your land, weather, and remembers all your works for the whole year.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Today's Tasks Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionHeading}>Today's Action Plan</Text>
            <Text style={styles.sectionSub}>Scheduled for {todayStr}</Text>
          </View>

          <TouchableOpacity
            style={styles.viewPlanLink}
            onPress={() => router.push('/tabs/ai')}
          >
            <Text style={styles.viewPlanLinkText}>Complete Plan</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {!hasPlan ? (
          <View style={[styles.noPlanCard, SHADOWS.sm]}>
            <View style={styles.noPlanIcon}>
              <Ionicons name="sparkles" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.noPlanTitle}>No Active Crop Plan Yet</Text>
            <Text style={styles.noPlanDesc}>
              Let GenZ Farm's condition-first engine inspect your soil and water parameters to build a balanced, risk-diversified seasonal plan.
            </Text>
            <TouchableOpacity
              style={styles.createPlanBtn}
              onPress={() => router.push('/tabs/ai')}
            >
              <Ionicons name="leaf" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.createPlanBtnText}>Generate My Farm Plan</Text>
            </TouchableOpacity>
          </View>
        ) : todayTasks.length === 0 ? (
          <View style={[styles.emptyTasksCard, SHADOWS.sm]}>
            <Ionicons name="checkmark-circle" size={38} color={COLORS.primary} />
            <Text style={styles.emptyTasksTitle}>No Specific Tasks Scheduled for Today</Text>
            <Text style={styles.emptyTasksDesc}>
              All scheduled activities for today are up to date. Open the Crop Planner tab to view upcoming seasonal milestones.
            </Text>
          </View>
        ) : (
          todayTasks.map((task) => (
            <View key={task.id} style={[styles.taskCard, SHADOWS.sm]}>
              <View style={styles.taskHeader}>
                <View style={styles.taskCropBadge}>
                  <Text style={styles.taskCropText}>{task.crop || 'Field Work'}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    task.status === 'done'
                      ? styles.statusDone
                      : task.status === 'skipped'
                      ? styles.statusSkipped
                      : styles.statusPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color:
                          task.status === 'done'
                            ? COLORS.success
                            : task.status === 'skipped'
                            ? COLORS.textMuted
                            : COLORS.warning,
                      },
                    ]}
                  >
                    {task.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.taskTitle}>{task.title}</Text>
              {task.description ? (
                <Text style={styles.taskDesc}>{task.description}</Text>
              ) : null}

              {/* Task Action Buttons */}
              <View style={styles.taskActions}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    task.status === 'done' ? styles.actionBtnDoneActive : styles.actionBtnDefault,
                  ]}
                  onPress={() => handleToggleTask(task.id, task.status === 'done' ? 'pending' : 'done')}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={task.status === 'done' ? '#ffffff' : COLORS.success}
                  />
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: task.status === 'done' ? '#ffffff' : COLORS.success },
                    ]}
                  >
                    {task.status === 'done' ? 'Completed' : 'Mark Completed'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    task.status === 'skipped' ? styles.actionBtnSkipActive : styles.actionBtnDefault,
                  ]}
                  onPress={() => handleToggleTask(task.id, task.status === 'skipped' ? 'pending' : 'skipped')}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={task.status === 'skipped' ? '#ffffff' : COLORS.danger}
                  />
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: task.status === 'skipped' ? '#ffffff' : COLORS.danger },
                    ]}
                  >
                    {task.status === 'skipped' ? 'Skipped' : 'Skip Task'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Daily Field Feedback Box */}
        <View style={[styles.feedbackCard, SHADOWS.sm]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWrap}>
              <Ionicons name="chatbox-ellipses" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Daily Field Observation</Text>
            </View>
          </View>
          <Text style={styles.feedbackHint}>
            Record field observations, rainfall events, or pest scouting notes to dynamically adapt your plan.
          </Text>

          <TextInput
            style={styles.feedbackInput}
            placeholder="e.g. Received 20mm rainfall; topsoil is saturated. Defer weeding by 3 days."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            value={feedbackNotes}
            onChangeText={(text) => {
              setFeedbackNotes(text);
              if (feedbackSuccess) setFeedbackSuccess('');
            }}
          />

          {feedbackSuccess ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.successBoxText}>{feedbackSuccess}</Text>
            </View>
          ) : null}

          <View style={styles.feedbackBtnRow}>
            <TouchableOpacity
              style={styles.saveFeedbackBtn}
              onPress={() => handleSubmitFeedback(false)}
              disabled={feedbackSending}
            >
              <Text style={styles.saveFeedbackBtnText}>
                {feedbackSending ? 'Saving...' : 'Save Observation'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.replanBtn}
              onPress={() => handleSubmitFeedback(true)}
              disabled={feedbackSending}
            >
              <Ionicons name="refresh" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.replanBtnText}>Update & Replan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 13,
    color: COLORS.primaryLight,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  farmerName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 5,
    fontWeight: '500',
  },
  farmSetupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
  },
  farmSetupBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 13.5,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 6,
  },
  weatherCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 8,
  },
  weatherBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weatherBadgeGood: {
    backgroundColor: COLORS.successSoft,
  },
  weatherBadgeWarn: {
    backgroundColor: COLORS.warningSoft,
  },
  weatherBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  weatherUnavailableBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningSoft,
    padding: 14,
    borderRadius: 12,
  },
  weatherUnavailableText: {
    fontSize: 14,
    color: COLORS.warning,
    marginLeft: 10,
    flex: 1,
    fontWeight: '600',
    lineHeight: 19,
  },
  weatherBody: {
    gap: 16,
  },
  currentWeatherHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
  },
  heroLeft: {
    flex: 1,
  },
  tempHeroText: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  weatherConditionText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '700',
    marginTop: 2,
  },
  tempRangeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  heroRightIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.borderHighlight,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCell: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  metricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  metricCellLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricCellValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  forecastSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  forecastSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  forecastHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  forecastScrollHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  forecastScrollContainer: {
    gap: 10,
    paddingBottom: 4,
  },
  forecastDayCard: {
    width: 82,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  forecastDayCardToday: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.borderHighlight,
    borderWidth: 1.5,
  },
  forecastDayName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  forecastDayDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
  forecastIconCircle: {
    marginVertical: 8,
  },
  forecastTempMax: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  forecastTempMin: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  forecastRainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 2,
  },
  forecastRainText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.info,
  },
  aiCompanionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderHighlight,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    gap: 12,
  },
  aiCompanionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCompanionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  aiCompanionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  viewPlanLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  viewPlanLinkText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 4,
  },
  noPlanCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  noPlanIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noPlanTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  noPlanDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  createPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 18,
  },
  createPlanBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyTasksCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 22,
  },
  emptyTasksTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 10,
  },
  emptyTasksDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  taskCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskCropBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskCropText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDone: {
    backgroundColor: COLORS.successSoft,
  },
  statusSkipped: {
    backgroundColor: COLORS.background,
  },
  statusPending: {
    backgroundColor: COLORS.warningSoft,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 22,
  },
  taskDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnDefault: {
    backgroundColor: '#ffffff',
    borderColor: COLORS.border,
  },
  actionBtnDoneActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  actionBtnSkipActive: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  feedbackCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 12,
    marginBottom: 24,
  },
  feedbackHint: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 19,
  },
  feedbackInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: '#ffffff',
    textAlignVertical: 'top',
    height: 90,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successSoft,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  successBoxText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '700',
    marginLeft: 8,
  },
  feedbackBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  saveFeedbackBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveFeedbackBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  replanBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replanBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
