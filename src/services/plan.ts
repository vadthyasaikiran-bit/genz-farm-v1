import { FarmPlan, FarmPlanTask } from './types';
import { getFarmProfile, getFarmPlan, saveFarmPlan, getFeedbackList } from './storage';
import { fetchLiveWeather } from './weather';
import { fetchMarketRecords } from './market';
import { respondToFarmAI, checkProfileCompleteness, isValidDateFormat } from './ai';

export type PlanGenerationResult = {
  success: boolean;
  plan: FarmPlan | null;
  error?: string;
  missingFields?: string[];
};

export function validateFarmPlan(plan: FarmPlan): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!plan) {
    errors.push('Plan object is empty or null.');
    return { isValid: false, errors };
  }

  if (!plan.tasks || !Array.isArray(plan.tasks)) {
    errors.push('Plan is missing a valid tasks array.');
  } else {
    for (let i = 0; i < plan.tasks.length; i++) {
      const t = plan.tasks[i];
      if (!t.title) {
        errors.push(`Task at index ${i} is missing a title.`);
      }
      if (!t.date || !isValidDateFormat(t.date)) {
        errors.push(`Task "${t.title || i}" has an invalid date "${t.date}". Expected YYYY-MM-DD.`);
      }
      if (!['pending', 'done', 'skipped'].includes(t.status)) {
        errors.push(`Task "${t.title || i}" has an invalid status "${t.status}".`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function generateAndSaveFarmPlan(): Promise<PlanGenerationResult> {
  try {
    const profile = await getFarmProfile();
    const completeness = checkProfileCompleteness(profile);

    if (!completeness.isSufficient) {
      return {
        success: false,
        plan: null,
        error: `Essential farm details are missing: ${completeness.missingFields.join(', ')}. Please complete your Farm Profile setup first.`,
        missingFields: completeness.missingFields,
      };
    }

    const currentPlan = await getFarmPlan();
    const feedback = await getFeedbackList();

    const weather = await fetchLiveWeather(profile!.latitude, profile!.longitude);
    const marketResp = await fetchMarketRecords({ limit: 10 });

    const newPlan = await respondToFarmAI({
      profile: profile!,
      weather,
      markets: marketResp.records,
      currentPlan,
      feedback,
      currentDate: new Date().toISOString().split('T')[0],
    });

    const validation = validateFarmPlan(newPlan);
    if (!validation.isValid) {
      return {
        success: false,
        plan: currentPlan,
        error: `Plan validation failed: ${validation.errors.join('; ')}`,
      };
    }

    await saveFarmPlan(newPlan);
    return {
      success: true,
      plan: newPlan,
    };
  } catch (err: any) {
    const oldPlan = await getFarmPlan();
    return {
      success: false,
      plan: oldPlan,
      error: err.message || 'Unknown planning error occurred. Old plan preserved.',
    };
  }
}

export async function replanFarmWithFeedback(notes?: string): Promise<PlanGenerationResult> {
  return await generateAndSaveFarmPlan();
}

export function getTodayTasks(plan: FarmPlan | null, targetDate?: string): FarmPlanTask[] {
  if (!plan || !plan.tasks) return [];
  const dateStr = targetDate || new Date().toISOString().split('T')[0];
  return plan.tasks.filter((t) => t.date === dateStr);
}

export function getUpcomingTasks(plan: FarmPlan | null, maxDays: number = 7): FarmPlanTask[] {
  if (!plan || !plan.tasks) return [];
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDays);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return plan.tasks.filter((t) => t.date >= todayStr && t.date <= maxDateStr);
}
