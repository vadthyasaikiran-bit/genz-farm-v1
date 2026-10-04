import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthSession, FarmProfile, FarmPlan, DailyFeedback, ChatMessage } from './types';

const STORAGE_KEYS = {
  AUTH_SESSION: '@genzfarm/auth_session',
  FARM_PROFILE: '@genzfarm/farm_profile',
  FARM_PLAN: '@genzfarm/farm_plan',
  FEEDBACK: '@genzfarm/feedback',
  CHAT_HISTORY: '@genzfarm/chat_history',
};

// --- AUTH SESSION ---
export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch (error) {
    console.error('Failed to get auth session from storage', error);
    return null;
  }
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save auth session to storage', error);
    throw error;
  }
}

export async function clearAuthSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  } catch (error) {
    console.error('Failed to clear auth session', error);
  }
}

// --- FARM PROFILE ---
export async function getFarmProfile(): Promise<FarmProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.FARM_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw) as FarmProfile;
  } catch (error) {
    console.error('Failed to get farm profile', error);
    return null;
  }
}

export async function saveFarmProfile(profile: FarmProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FARM_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save farm profile', error);
    throw error;
  }
}

export async function clearFarmProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.FARM_PROFILE);
  } catch (error) {
    console.error('Failed to clear farm profile', error);
  }
}

// --- FARM PLAN ---
export async function getFarmPlan(): Promise<FarmPlan | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.FARM_PLAN);
    if (!raw) return null;
    return JSON.parse(raw) as FarmPlan;
  } catch (error) {
    console.error('Failed to get farm plan', error);
    return null;
  }
}

export async function saveFarmPlan(plan: FarmPlan): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FARM_PLAN, JSON.stringify(plan));
  } catch (error) {
    console.error('Failed to save farm plan', error);
    throw error;
  }
}

export async function updateTaskStatus(taskId: string, status: 'pending' | 'done' | 'skipped'): Promise<FarmPlan | null> {
  try {
    const plan = await getFarmPlan();
    if (!plan || !plan.tasks) return null;

    let updated = false;
    const newTasks = plan.tasks.map((task) => {
      if (task.id === taskId) {
        updated = true;
        return { ...task, status };
      }
      return task;
    });

    if (!updated) return plan;

    const newSeasons = plan.seasons?.map((season) => ({
      ...season,
      tasks: season.tasks?.map((t) => (t.id === taskId ? { ...t, status } : t)),
    }));

    const updatedPlan: FarmPlan = {
      ...plan,
      tasks: newTasks,
      seasons: newSeasons,
      updatedAt: new Date().toISOString(),
    };

    await saveFarmPlan(updatedPlan);
    return updatedPlan;
  } catch (error) {
    console.error('Failed to update task status', error);
    return null;
  }
}

export async function clearFarmPlan(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.FARM_PLAN);
  } catch (error) {
    console.error('Failed to clear farm plan', error);
  }
}

// --- FEEDBACK ---
export async function getFeedbackList(): Promise<DailyFeedback[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.FEEDBACK);
    if (!raw) return [];
    return JSON.parse(raw) as DailyFeedback[];
  } catch (error) {
    console.error('Failed to get feedback list', error);
    return [];
  }
}

export async function saveFeedback(entry: DailyFeedback): Promise<void> {
  try {
    const list = await getFeedbackList();
    const updated = [entry, ...list];
    await AsyncStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save feedback', error);
    throw error;
  }
}

// --- PERSISTENT AI COMPANION CHAT HISTORY ---
export async function getChatHistory(): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch (error) {
    console.error('Failed to get chat history', error);
    return [];
  }
}

export async function saveChatMessage(message: ChatMessage): Promise<void> {
  try {
    const history = await getChatHistory();
    const updated = [...history, message];
    // Keep up to 100 messages in persistent memory
    const trimmed = updated.slice(-100);
    await AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save chat message', error);
  }
}

export async function clearChatHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  } catch (error) {
    console.error('Failed to clear chat history', error);
  }
}
