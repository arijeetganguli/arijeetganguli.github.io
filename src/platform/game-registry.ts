import { gitQuest } from "../games/git-quest/game";
import { sqlDetective } from "../games/sql-detective/game";
import type { GameDefinition } from "./types";

const comingSoonGames: GameDefinition[] = [
  {
    id: "iceberg-rescue",
    title: "Iceberg Rescue",
    shortTitle: "Iceberg Rescue",
    description: "Restore a data lake before small files and stale snapshots take over.",
    category: "Apache Iceberg",
    difficulty: "Intermediate",
    estimatedMinutes: 20,
    status: "coming-soon",
    icon: "◇",
    missions: [],
  },
  {
    id: "pipeline-wars",
    title: "Pipeline Wars",
    shortTitle: "Pipeline Wars",
    description: "Balance latency, reliability, and cost in a production data pipeline.",
    category: "Data Engineering",
    difficulty: "Intermediate",
    estimatedMinutes: 25,
    status: "coming-soon",
    icon: "↗",
    missions: [],
  },
  {
    id: "system-design-arena",
    title: "System Design Arena",
    shortTitle: "System Design Arena",
    description: "Design resilient systems as traffic and constraints evolve.",
    category: "System Design",
    difficulty: "Advanced",
    estimatedMinutes: 30,
    status: "coming-soon",
    icon: "⌘",
    missions: [],
  },
];

export const gameRegistry: GameDefinition[] = [gitQuest, sqlDetective, ...comingSoonGames];

export function getGame(gameId: string): GameDefinition | undefined {
  return gameRegistry.find((game) => game.id === gameId);
}
