import { DailyFeedback, FarmPlan } from './types';
import { saveFeedback, getFeedbackList, updateTaskStatus, getFarmPlan } from './storage';
import { replanFarmWithFeedback } from './plan';

export async function submitDailyFeedback(params: {
  notes: string;
  weatherObservation?: string;
  cropCondition?: string;
  triggerReplan?: boolean;
}): Promise<{ feedback: DailyFeedback; updatedPlan?: FarmPlan | null; error?: string }> {
  const today = new Date().toISOString().split('T')[0];

  const plan = await getFarmPlan();
  const completedTaskIds = plan?.tasks.filter((t) => t.status === 'done').map((t) => t.id) || [];
  const skippedTaskIds = plan?.tasks.filter((t) => t.status === 'skipped').map((t) => t.id) || [];

  const entry: DailyFeedback = {
    id: `fb-${Date.now()}`,
    date: today,
    notes: params.notes,
    weatherObservation: params.weatherObservation,
    cropCondition: params.cropCondition,
    tasksCompletedIds: completedTaskIds,
    tasksSkippedIds: skippedTaskIds,
    createdAt: new Date().toISOString(),
  };

  await saveFeedback(entry);

  if (params.triggerReplan) {
    const replanResult = await replanFarmWithFeedback(params.notes);
    if (!replanResult.success) {
      return {
        feedback: entry,
        updatedPlan: plan,
        error: replanResult.error,
      };
    }
    return {
      feedback: entry,
      updatedPlan: replanResult.plan,
    };
  }

  return {
    feedback: entry,
    updatedPlan: plan,
  };
}

export async function setTaskStatus(
  taskId: string,
  status: 'pending' | 'done' | 'skipped'
): Promise<FarmPlan | null> {
  return await updateTaskStatus(taskId, status);
}

export async function fetchAllFeedback(): Promise<DailyFeedback[]> {
  return await getFeedbackList();
}
