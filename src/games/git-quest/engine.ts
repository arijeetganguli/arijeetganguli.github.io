import type { GameProgress, Mission, MissionRun } from "../../platform/types";

export interface CommandResult {
  accepted: boolean;
  message: string;
  completedMission: boolean;
  missionScore: number;
  progress: GameProgress;
}

export function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ").toLowerCase();
}

export function getMissionRun(progress: GameProgress, mission: Mission): MissionRun {
  const run = progress.missionRuns[mission.id] ?? {
    stepIndex: 0,
    incorrectAttempts: 0,
    hintsUsed: 0,
    hintedStepIds: [],
  };
  return { ...run, hintedStepIds: run.hintedStepIds ?? [] };
}

export function submitMissionCommand(
  progress: GameProgress,
  mission: Mission,
  command: string,
  missionIndex: number,
  missionCount: number,
  selectedChoice?: string,
): CommandResult {
  const run = getMissionRun(progress, mission);
  const step = mission.steps[run.stepIndex];
  if (!step) {
    return { accepted: false, message: "This mission is already complete.", completedMission: false, missionScore: 0, progress };
  }

  const commandAccepted = step.acceptedCommands.some((candidate) => normalizeCommand(candidate) === normalizeCommand(command));
  const choiceAccepted = !step.correctChoiceId || selectedChoice === step.correctChoiceId;
  const accepted = commandAccepted && choiceAccepted;
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const nextProgress: GameProgress = {
    ...progress,
    lastPlayedAt: now.toISOString(),
    lastPlayedDay: day,
    streak: progress.lastPlayedDay === day
      ? progress.streak
      : progress.lastPlayedDay === new Date(now.getTime() - 86400000).toISOString().slice(0, 10)
        ? progress.streak + 1
        : 1,
  };

  if (!accepted) {
    nextProgress.missionRuns = {
      ...progress.missionRuns,
      [mission.id]: { ...run, incorrectAttempts: run.incorrectAttempts + 1 },
    };
    return {
      accepted: false,
      message: commandAccepted && !choiceAccepted
        ? step.choiceFeedback?.[selectedChoice ?? ""] ?? "Choose the behavior that matches the agreed requirement before staging the resolution."
        : `No simulated change was made. This step is about: ${step.objective} Review the repository state, then try again.`,
      completedMission: false,
      missionScore: 0,
      progress: nextProgress,
    };
  }

  const updatedRun = { ...run, stepIndex: run.stepIndex + 1 };
  const completedMission = updatedRun.stepIndex === mission.steps.length;
  const alreadyCompleted = progress.completedMissions.includes(mission.id);
  let missionScore = 0;
  let completedMissions = progress.completedMissions;
  let score = progress.score;
  let xp = progress.xp;
  let achievements = progress.achievements;
  let currentMission = progress.currentMission;
  let missionScores = progress.missionScores;
  let missionRuns: GameProgress["missionRuns"] = {
    ...progress.missionRuns,
    [mission.id]: updatedRun,
  };
  let message = step.success;

  if (completedMission) {
    if (!alreadyCompleted) {
      missionScore = Math.max(30, mission.points - run.incorrectAttempts * 15 - run.hintsUsed * 20);
      score += missionScore;
      xp += missionScore;
      completedMissions = [...completedMissions, mission.id];
      missionScores = { ...missionScores, [mission.id]: missionScore };
      achievements = awardAchievements(achievements, mission.id, completedMissions.length);
      message = `${step.success} Mission clear: +${missionScore} points and +${missionScore} XP.`;
    }
    currentMission = Math.max(currentMission, Math.min(missionIndex + 1, missionCount));
  }

  nextProgress.currentMission = currentMission;
  nextProgress.completedMissions = completedMissions;
  nextProgress.score = score;
  nextProgress.xp = xp;
  nextProgress.achievements = achievements;
  nextProgress.missionScores = missionScores;
  nextProgress.missionRuns = missionRuns;

  return { accepted: true, message, completedMission, missionScore, progress: nextProgress };
}

export function useMissionHint(
  progress: GameProgress,
  mission: Mission,
): { hint: string; alreadyUsed: boolean; progress: GameProgress } {
  const run = getMissionRun(progress, mission);
  const step = mission.steps[run.stepIndex];
  if (!step) return { hint: "This mission is complete.", alreadyUsed: true, progress };
  if (run.hintedStepIds.includes(step.id)) return { hint: step.hint, alreadyUsed: true, progress };

  return {
    hint: step.hint,
    alreadyUsed: false,
    progress: {
      ...progress,
      lastPlayedAt: new Date().toISOString(),
      hintsUsed: progress.hintsUsed + 1,
      missionRuns: {
        ...progress.missionRuns,
        [mission.id]: {
          ...run,
          hintsUsed: run.hintsUsed + 1,
          hintedStepIds: [...run.hintedStepIds, step.id],
        },
      },
    },
  };
}

export function awardAchievements(
  current: string[],
  missionId: string,
  completedCount: number,
): string[] {
  const awards: Record<string, string> = {
    "first-commit": "first-commit",
    "branch-out": "branch-master",
    conflict: "conflict-resolver",
    "time-travel": "history-detective",
    "production-emergency": "git-survivor",
  };
  const unlocked = [...current];
  const award = awards[missionId];
  if (award && !unlocked.includes(award)) unlocked.push(award);
  if (completedCount === 10 && !unlocked.includes("git-master")) unlocked.push("git-master");
  return unlocked;
}
