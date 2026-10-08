export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";
export type GameStatus = "available" | "coming-soon";

export interface MissionStep {
  id: string;
  objective: string;
  acceptedCommands: string[];
  hint: string;
  success: string;
  choices?: { id: string; label: string }[];
  correctChoiceId?: string;
  choiceFeedback?: Record<string, string>;
  incorrectFeedback?: { command: string; message: string }[];
}

export interface Mission {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  objective: string;
  difficulty: Difficulty;
  points: number;
  repository: string[];
  branch?: string;
  branchProgression?: { afterStep: number; branch: string }[];
  repositorySnapshots?: { afterStep: number; lines: string[] }[];
  steps: MissionStep[];
}

export interface GameDefinition {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  status: GameStatus;
  icon: string;
  missions: Mission[];
}

export interface MissionRun {
  stepIndex: number;
  incorrectAttempts: number;
  hintsUsed: number;
  hintedStepIds: string[];
}

export interface GameProgress {
  gameId: string;
  currentMission: number;
  completedMissions: string[];
  score: number;
  xp: number;
  hintsUsed: number;
  achievements: string[];
  lastPlayedAt: string;
  streak: number;
  lastPlayedDay: string;
  missionRuns: Record<string, MissionRun>;
  missionScores: Record<string, number>;
}

export interface ProgressStore {
  getGameProgress(gameId: string): Promise<GameProgress | null>;
  saveGameProgress(progress: GameProgress): Promise<void>;
  resetGameProgress(gameId: string): Promise<void>;
}
