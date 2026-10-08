import { gitQuestMissions } from "./missions";
import type { GameDefinition } from "../../platform/types";

export const gitQuest: GameDefinition = {
  id: "git-quest",
  title: "Git Quest",
  shortTitle: "Git Quest",
  description: "Safely manage a changing codebase through real-world Git missions.",
  category: "Version control",
  difficulty: "Beginner",
  estimatedMinutes: 35,
  status: "available",
  icon: "⌘",
  missions: gitQuestMissions,
};
