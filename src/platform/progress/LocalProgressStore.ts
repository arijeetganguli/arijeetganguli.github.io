import type { GameProgress, ProgressStore } from "../types";

const STORAGE_KEY = "stavion-labs-progress-v1";

export const createFreshProgress = (gameId: string): GameProgress => ({
  gameId,
  currentMission: 0,
  completedMissions: [],
  score: 0,
  xp: 0,
  hintsUsed: 0,
  achievements: [],
  lastPlayedAt: "",
  streak: 0,
  lastPlayedDay: "",
  missionRuns: {},
  missionScores: {},
});

function isGameProgress(value: unknown): value is GameProgress {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GameProgress>;
  return (
    typeof candidate.gameId === "string" &&
    typeof candidate.currentMission === "number" &&
    Array.isArray(candidate.completedMissions) &&
    typeof candidate.score === "number" &&
    typeof candidate.xp === "number" &&
    typeof candidate.hintsUsed === "number" &&
    Array.isArray(candidate.achievements)
  );
}

export class LocalProgressStore implements ProgressStore {
  async getGameProgress(gameId: string): Promise<GameProgress | null> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Saved progress is not a valid object.");
    }

    const gameProgress = (parsed as Record<string, unknown>)[gameId];
    if (gameProgress === undefined) return null;
    if (!isGameProgress(gameProgress)) {
      throw new Error(`Saved progress for ${gameId} is invalid.`);
    }
    return gameProgress;
  }

  async saveGameProgress(progress: GameProgress): Promise<void> {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Saved progress data is not a valid game map.");
    }
    const gameMap = parsed as Record<string, GameProgress>;
    gameMap[progress.gameId] = progress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameMap));
  }

  async resetGameProgress(gameId: string): Promise<void> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Saved progress data is not a valid game map.");
    }
    const gameMap = parsed as Record<string, GameProgress>;
    delete gameMap[gameId];
    if (Object.keys(gameMap).length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(gameMap));
  }
}

export const localProgressStore = new LocalProgressStore();
