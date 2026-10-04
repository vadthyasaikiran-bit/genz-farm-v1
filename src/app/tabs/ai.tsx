import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FarmProfile, FarmPlan, WeatherData, MarketRecord, ChatMessage } from '../../services/types';
import {
  getFarmProfile,
  getFarmPlan,
  getChatHistory,
  saveChatMessage,
  clearChatHistory,
  getFeedbackList,
} from '../../services/storage';
import { fetchLiveWeather } from '../../services/weather';
import { fetchMarketRecords } from '../../services/market';
import { chatWithFarmAI, checkProfileCompleteness } from '../../services/ai';
import { generateAndSaveFarmPlan, replanFarmWithFeedback } from '../../services/plan';
import { setTaskStatus } from '../../services/feedback';
import { COLORS, SHADOWS } from '../../constants/theme';

export default function AIScreen() {
  const router = useRouter();
  const chatScrollRef = useRef<ScrollView>(null);

  const [activeTab, setActiveTab] = useState<'chat' | 'schedule'>('chat');
  const [profile, setProfile] = useState<FarmProfile | null>(null);
  const [plan, setPlan] = useState<FarmPlan | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [markets, setMarkets] = useState<MarketRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [planning, setPlanning] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const p = await getFarmProfile();
      setProfile(p);

      const savedPlan = await getFarmPlan();
      setPlan(savedPlan);

      if (p && p.latitude && p.longitude) {
        const w = await fetchLiveWeather(p.latitude, p.longitude);
        setWeather(w);
      }

      const m = await fetchMarketRecords({ limit: 5 });
      setMarkets(m.records);

      const savedHistory = await getChatHistory();
      if (savedHistory.length > 0) {
        setMessages(savedHistory);
      } else {
        const farmerName = p?.name ? p.name.split(' ')[0] : 'Farmer';
        const land = p?.land || 'your land';
        const soil = p?.soil || 'your soil';
        const initialMsg: ChatMessage = {
          id: 'welcome-1',
          sender: 'assistant',
          text: 'Namaste ' + farmerName + ' ji! 🙏 I am your personal GenZ Farm companion.\n\nI know your ' + land + ' of ' + soil + ' in ' + (p?.village || 'your village') + ', your verified weather, APMC mandi rates, and your full-year work schedule.\n\nI am with you step-by-step from ploughing and sowing to weeding, pest scouting, and final harvest selling.\n\nHow can I guide you today on your farm?',
          timestamp: new Date().toISOString(),
          actionSuggestions: [
            'What should I do today?',
            'Check weather & rain impact',
            'Latest Mandi rates for my crop',
            'Review my full year work plan',
          ],
        };
        setMessages([initialMsg]);
        await saveChatMessage(initialMsg);
      }
    } catch (err) {
      console.error('Failed to load AI companion context:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'chat') {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || sending) return;

    setInputText('');
    setSending(true);

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    await saveChatMessage(userMsg);

    try {
      const fbList = await getFeedbackList();
      const aiReply = await chatWithFarmAI({
        userMessage: textToSend,
        history: newHistory,
        profile,
        weather,
        markets,
        plan,
        feedback: fbList,
      });

      const updatedHistory = [...newHistory, aiReply];
      setMessages(updatedHistory);
      await saveChatMessage(aiReply);
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: 'I am here watching your field. Please ask again!',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Reset Conversation',
      'Start a fresh conversation? Your farm profile and year plan will remain intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Chat',
          style: 'destructive',
          onPress: async () => {
            await clearChatHistory();
            loadData();
          },
        },
      ]
    );
  };

  const handleGeneratePlan = async () => {
    const completeness = checkProfileCompleteness(profile);
    if (!completeness.isSufficient) {
      Alert.alert(
        'Farm Setup Required',
        'Please complete your Farm Profile details: ' + completeness.missingFields.join(', '),
        [
          { text: 'Go to Farm Setup', onPress: () => router.push('/tabs/farm') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    setPlanning(true);
    try {
      const res = await generateAndSaveFarmPlan();
      if (!res.success) {
        Alert.alert('Planning Alert', res.error || 'Failed to generate plan.');
      } else {
        setPlan(res.plan);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unexpected planning error.');
    } finally {
      setPlanning(false);
    }
  };

  const handleReplan = async () => {
    setPlanning(true);
    try {
      const res = await replanFarmWithFeedback('Farmer requested plan regeneration.');
      if (!res.success) {
        Alert.alert('Notice', res.error || 'Replanning failed. Old plan retained.');
      } else {
        setPlan(res.plan);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error replanning farm.');
    } finally {
      setPlanning(false);
    }
  };

  const handleToggleTask = async (taskId: string, newStatus: 'pending' | 'done' | 'skipped') => {
    try {
      const updated = await setTaskStatus(taskId, newStatus);
      if (updated) {
        setPlan(updated);
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Connecting with your Farm Buddy...</Text>
      </View>
    );
  }

  const latestSuggestions = messages[messages.length - 1]?.actionSuggestions || [
    'What should I do today?',
    'Check weather & rain impact',
    'Latest Mandi rates for my crop',
    'Review my full year work plan',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.topHeader}>
          <View style={styles.companionHeaderLeft}>
            <View style={styles.companionAvatar}>
              <Ionicons name="sparkles" size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.companionTitle}>Farm Buddy AI</Text>
              <Text style={styles.companionSub}>Personal Agricultural Guide</Text>
            </View>
          </View>

          {activeTab === 'chat' ? (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearChat}>
              <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.switcherContainer}>
          <TouchableOpacity
            style={[styles.switcherTab, activeTab === 'chat' && styles.switcherTabActive]}
            onPress={() => setActiveTab('chat')}
          >
            <Ionicons
              name={activeTab === 'chat' ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              size={18}
              color={activeTab === 'chat' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.switcherLabel, activeTab === 'chat' && styles.switcherLabelActive]}>
              Talk with Farm Buddy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switcherTab, activeTab === 'schedule' && styles.switcherTabActive]}
            onPress={() => setActiveTab('schedule')}
          >
            <Ionicons
              name={activeTab === 'schedule' ? 'calendar' : 'calendar-outline'}
              size={18}
              color={activeTab === 'schedule' ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.switcherLabel, activeTab === 'schedule' && styles.switcherLabelActive]}>
              Year Schedule ({plan?.tasks?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'chat' ? (
          <View style={styles.chatWrapper}>
            <View style={styles.contextPillBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contextScroll}>
                <View style={styles.contextChip}>
                  <Ionicons name="leaf" size={13} color={COLORS.primary} />
                  <Text style={styles.contextChipText}>{(profile?.land || 'Land') + ' • ' + (profile?.soil || 'Soil')}</Text>
                </View>
                {weather && !weather.isUnavailable ? (
                  <View style={styles.contextChip}>
                    <Ionicons name="partly-sunny" size={13} color={COLORS.accent} />
                    <Text style={styles.contextChipText}>{weather.temperature + '°C ' + weather.conditionDescription}</Text>
                  </View>
                ) : null}
                {markets && markets.length > 0 ? (
                  <View style={styles.contextChip}>
                    <Ionicons name="trending-up" size={13} color={COLORS.info} />
                    <Text style={styles.contextChipText}>{markets[0].commodity + ' ₹' + markets[0].modalPrice + '/q'}</Text>
                  </View>
                ) : null}
                <View style={styles.contextChip}>
                  <Ionicons name="checkmark-circle" size={13} color={COLORS.success} />
                  <Text style={styles.contextChipText}>{(plan?.tasks?.length || 0) + ' Year Tasks'}</Text>
                </View>
              </ScrollView>
            </View>

            <ScrollView
              ref={chatScrollRef}
              style={styles.chatScroll}
              contentContainerStyle={styles.chatContentContainer}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageRow,
                      isUser ? styles.messageRowUser : styles.messageRowAssistant,
                    ]}
                  >
                    {!isUser ? (
                      <View style={styles.botAvatar}>
                        <Ionicons name="leaf" size={16} color={COLORS.primary} />
                      </View>
                    ) : null}

                    <View
                      style={[
                        styles.messageBubble,
                        isUser ? styles.userBubble : styles.assistantBubble,
                        !isUser && SHADOWS.sm,
                      ]}
                    >
                      <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
                        {msg.text}
                      </Text>
                      <Text style={[styles.messageTime, isUser ? styles.userTime : styles.assistantTime]}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {sending ? (
                <View style={[styles.messageRow, styles.messageRowAssistant]}>
                  <View style={styles.botAvatar}>
                    <Ionicons name="leaf" size={16} color={COLORS.primary} />
                  </View>
                  <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble, SHADOWS.sm]}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.typingText}>Farm Buddy is thinking...</Text>
                  </View>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.suggestionWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionScroll}>
                {latestSuggestions.map((s, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionChip}
                    onPress={() => handleSendMessage(s)}
                    disabled={sending}
                  >
                    <Ionicons name="chatbubbles-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.suggestionChipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Ask Farm Buddy about crops, weather, work..."
                placeholderTextColor={COLORS.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={400}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
                onPress={() => handleSendMessage()}
                disabled={!inputText.trim() || sending}
              >
                <Ionicons name="arrow-up" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scheduleScroll}>
            <View style={[styles.card, SHADOWS.sm]}>
              <View style={styles.badgeRow}>
                <View style={styles.planStatusBadge}>
                  <Text style={styles.planStatusBadgeText}>{plan?.status || 'ACTIVE CROP PLAN'}</Text>
                </View>
                <Text style={styles.updatedDate}>
                  Updated: {plan?.updatedAt ? new Date(plan.updatedAt).toLocaleDateString() : 'Active'}
                </Text>
              </View>

              <Text style={styles.summaryHeading}>Full-Year Agronomic Roadmap</Text>
              <Text style={styles.summaryText}>{plan?.summary || 'Tap below to build your seasonal schedule.'}</Text>

              <TouchableOpacity
                style={styles.replanActionBtn}
                onPress={plan ? handleReplan : handleGeneratePlan}
                disabled={planning}
              >
                {planning ? (
                  <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="refresh" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.replanActionBtnText}>
                  {planning ? 'Updating schedule...' : plan ? 'Replan Schedule' : 'Generate Yearly Plan'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionTitleRow}>
              <Ionicons name="pie-chart" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitleText}>Land Allocation & Crop Trade-offs</Text>
            </View>

            {(plan?.cropStrategy || []).map((cs, idx) => (
              <View key={idx} style={[styles.cropCard, SHADOWS.sm]}>
                <View style={styles.cropHeader}>
                  <View>
                    <Text style={styles.cropName}>{cs.crop}</Text>
                    <Text style={styles.cropArea}>Allocated: {cs.area}</Text>
                  </View>
                  <View style={styles.riskBadge}>
                    <Text style={styles.riskBadgeText}>{cs.risk || 'Balanced'} Risk</Text>
                  </View>
                </View>

                <Text style={styles.cropReason}>{cs.reason}</Text>

                <View style={styles.cropAttributes}>
                  <View style={styles.attrItem}>
                    <Text style={styles.attrLabel}>WATER</Text>
                    <Text style={styles.attrVal}>{cs.water || 'Standard'}</Text>
                  </View>
                  <View style={styles.attrItem}>
                    <Text style={styles.attrLabel}>DURATION</Text>
                    <Text style={styles.attrVal}>{cs.duration || '120-150d'}</Text>
                  </View>
                  <View style={styles.attrItem}>
                    <Text style={styles.attrLabel}>LABOUR</Text>
                    <Text style={styles.attrVal}>{cs.labour || 'Moderate'}</Text>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.sectionTitleRow}>
              <Ionicons name="list" size={20} color={COLORS.info} />
              <Text style={styles.sectionTitleText}>Scheduled Farm Works ({plan?.tasks?.length || 0})</Text>
            </View>
            <Text style={styles.subRuleNote}>
              Farm Buddy remembers every completed and skipped task to guide you throughout the year.
            </Text>

            {(plan?.tasks || []).map((task) => (
              <View key={task.id} style={[styles.taskItemCard, SHADOWS.sm]}>
                <View style={styles.taskItemHeader}>
                  <View style={styles.taskDateBadge}>
                    <Ionicons name="calendar" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.taskDateText}>{task.date}</Text>
                  </View>
                  <View
                    style={[
                      styles.taskStatusPill,
                      task.status === 'done'
                        ? styles.pillDone
                        : task.status === 'skipped'
                        ? styles.pillSkipped
                        : styles.pillPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.taskStatusPillText,
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

                <Text style={styles.taskItemTitle}>{task.title}</Text>
                {task.description ? (
                  <Text style={styles.taskItemDesc}>{task.description}</Text>
                ) : null}

                <View style={styles.taskActionRow}>
                  <TouchableOpacity
                    style={[
                      styles.taskToggleBtn,
                      task.status === 'done' && styles.taskToggleBtnDone,
                    ]}
                    onPress={() =>
                      handleToggleTask(task.id, task.status === 'done' ? 'pending' : 'done')
                    }
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={task.status === 'done' ? '#ffffff' : COLORS.success}
                    />
                    <Text
                      style={[
                        styles.taskToggleText,
                        { color: task.status === 'done' ? '#ffffff' : COLORS.success },
                      ]}
                    >
                      {task.status === 'done' ? 'Completed' : 'Mark Completed'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.taskToggleBtn,
                      task.status === 'skipped' && styles.taskToggleBtnSkip,
                    ]}
                    onPress={() =>
                      handleToggleTask(task.id, task.status === 'skipped' ? 'pending' : 'skipped')
                    }
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={task.status === 'skipped' ? '#ffffff' : COLORS.danger}
                    />
                    <Text
                      style={[
                        styles.taskToggleText,
                        { color: task.status === 'skipped' ? '#ffffff' : COLORS.danger },
                      ]}
                    >
                      {task.status === 'skipped' ? 'Skipped' : 'Skip Task'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  companionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: COLORS.borderHighlight,
  },
  companionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.text,
  },
  companionSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  clearBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  switcherTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  switcherTabActive: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
  },
  switcherLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  switcherLabelActive: {
    color: COLORS.primary,
  },
  chatWrapper: {
    flex: 1,
  },
  contextPillBar: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  contextScroll: {
    gap: 8,
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  contextChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  chatScroll: {
    flex: 1,
    paddingHorizontal: 18,
  },
  chatContentContainer: {
    paddingVertical: 12,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: 1,
    borderColor: COLORS.borderHighlight,
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  assistantText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  userTime: {
    color: '#d1fae5',
  },
  assistantTime: {
    color: COLORS.textMuted,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  typingText: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  suggestionWrap: {
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  suggestionScroll: {
    paddingHorizontal: 18,
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: COLORS.borderHighlight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  suggestionChipText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.6,
  },
  scheduleScroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planStatusBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planStatusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  updatedDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  summaryHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14.5,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  replanActionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  replanActionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 8,
  },
  subRuleNote: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },
  cropCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  cropArea: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  riskBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  cropReason: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginVertical: 6,
  },
  cropAttributes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  attrItem: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  attrLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '800',
  },
  attrVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  taskItemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  taskStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillDone: {
    backgroundColor: COLORS.successSoft,
  },
  pillSkipped: {
    backgroundColor: COLORS.background,
  },
  pillPending: {
    backgroundColor: COLORS.warningSoft,
  },
  taskStatusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  taskItemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 20,
  },
  taskItemDesc: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  taskActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  taskToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#ffffff',
  },
  taskToggleBtnDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  taskToggleBtnSkip: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  taskToggleText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
});
