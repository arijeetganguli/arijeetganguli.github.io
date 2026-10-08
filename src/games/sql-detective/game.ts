import type { GameDefinition } from "../../platform/types";
import { sqlDetectiveMissions } from "./missions";

export const sqlDetective: GameDefinition = {
  id: "sql-detective",
  title: "SQL Detective",
  shortTitle: "SQL Detective",
  description: "Investigate realistic datasets with PostgreSQL-style SQL, and learn why a query works—or what its results miss.",
  category: "SQL",
  difficulty: "Beginner",
  estimatedMinutes: 60,
  status: "available",
  icon: "⌘",
  missions: sqlDetectiveMissions,
};
