Yes. I would change the core product principle from **“training modules”** to **“interactive learning games.”** That gives Stavion Labs a much stronger identity and keeps future sessions consistent.

Here is the revised spec for Copilot:

# Stavion Labs Interactive Learning Games

## 1. Product Vision

Build **Stavion Labs**, a GitHub hosted platform for learning technical concepts through interactive games and simulations.

The platform should not feel like an online course or documentation site. Every learning experience should be a **game, challenge, simulation, puzzle, or interactive mission** where the user learns by doing.

The MVP is **Git Quest**.

Future games can cover:

* SQL
* Apache Iceberg
* Data Engineering
* Python
* System Design
* Cloud
* APIs
* Databases
* GitHub
* Distributed Systems

## 2. Landing Page

Create a modern developer focused landing page for Stavion Labs.

Hero:

**Stavion Labs**

**Learn technology by playing.**

Short description:

> Interactive games and simulations that help developers learn by solving real engineering problems.

Primary CTA:

**Start Playing**

Secondary CTA:

**Explore Games**

Display available games as cards.

Example:

| Game                | Concept          | Difficulty   | Status      |
| ------------------- | ---------------- | ------------ | ----------- |
| Git Quest           | Git              | Beginner     | Available   |
| SQL Detective       | SQL              | Beginner     | Coming Soon |
| Iceberg Rescue      | Apache Iceberg   | Intermediate | Coming Soon |
| Pipeline Wars       | Data Engineering | Intermediate | Coming Soon |
| System Design Arena | System Design    | Advanced     | Coming Soon |

The catalogue should be designed so new games can be added without changing the landing page code.

## 3. Core Game Philosophy

Every game should follow this model:

```text
Scenario
   ↓
Challenge
   ↓
User Action
   ↓
Game Validation
   ↓
Feedback
   ↓
Score / Reward
   ↓
Next Challenge
```

Avoid long explanations.

Teach concepts through:

* Missions
* Puzzles
* Simulated environments
* Decision making
* Command based challenges
* Debugging
* Resource management
* Incident scenarios
* Time based challenges
* Progressive difficulty

Explanations should appear **after the user attempts the challenge**, rather than being presented as a traditional lesson.

## 4. Git Quest MVP

Git Quest is the first fully functional game.

Theme:

> You have joined a development team. Your job is to safely manage a changing codebase while completing increasingly difficult Git missions.

The game should simulate a Git repository entirely in the browser.

Suggested missions:

### Mission 1: First Commit

Create your first commit.

Learn:

* git init
* git status
* git add
* git commit

### Mission 2: The Missing Change

Find which files have changed and commit the correct files.

### Mission 3: Branch Out

Create a feature branch and make changes without affecting main.

### Mission 4: Merge It

Merge the feature into main.

### Mission 5: Conflict!

Two developers changed the same file.

Resolve the merge conflict.

### Mission 6: Time Travel

Recover an earlier version of the repository.

Teach:

* git log
* git checkout
* git restore
* git revert

### Mission 7: The Bad Commit

A bad commit has reached the branch.

Fix it without destroying useful history.

### Mission 8: Remote Mission

Simulate:

* clone
* fetch
* pull
* push

### Mission 9: Lost Work

Recover accidentally deleted work.

### Mission 10: Production Emergency

A realistic final scenario combining multiple Git concepts.

## 5. Game Interface

The Git Quest UI should feel like a lightweight game rather than a course.

Example:

```text
STAVION LABS

GIT QUEST                         Level 6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MISSION 06
THE BAD COMMIT

Your team has discovered that the latest commit
introduced a configuration error.

Your objective:

Remove the bad change while preserving history.

REPOSITORY

main
 ├── 8a72c1 Add API configuration
 ├── 9bc21f Add authentication
 └── f31a42 ❌ Broken configuration

TERMINAL

$ git __________________________

[ Execute ]

────────────────────────────────────────────

Mission Progress       ███████████░░  8/10
Score                  760
Streak                 🔥 4
Hints                  1

[ Hint ]
```

The exact UI can evolve during development.

## 6. Game Mechanics

Git Quest should support:

* XP
* Score
* Levels
* Streaks
* Hints
* Penalties
* Mission completion
* Achievement badges
* Progress tracking
* Final score

Keep the mechanics lightweight. The primary goal is learning.

Example achievements:

* First Commit
* Branch Master
* Conflict Resolver
* History Detective
* Git Survivor
* Git Master

## 7. Local First

Everything in the MVP must run locally in the browser.

No backend.

No authentication.

No external API dependency.

Game content should be represented as local TypeScript or JSON.

Game state should be maintained using `localStorage`.

Store:

```typescript
interface GameProgress {
  gameId: string;
  currentMission: number;
  completedMissions: string[];
  score: number;
  xp: number;
  hintsUsed: number;
  achievements: string[];
  lastPlayedAt: string;
}
```

## 8. Game Engine

Do not build Git Quest as one large page.

Create a reusable game engine that future games can use.

Conceptually:

```text
Game Platform
│
├── Game Registry
│
├── Game Engine
│   ├── Missions
│   ├── State
│   ├── Scoring
│   ├── Validation
│   └── Progress
│
├── Git Quest
│
├── SQL Detective
│
├── Iceberg Rescue
│
└── Future Games
```

Each game should own its content and game specific validation logic.

The platform owns common functionality such as navigation, progress, scoring, achievements and persistence.

## 9. Game Definition

Games should expose metadata similar to:

```typescript
interface GameDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  status: "available" | "coming-soon";
  missions: Mission[];
}
```

This allows the landing page to automatically display new games.

## 10. Future Authentication

Do not implement authentication in the MVP.

However, design persistence behind an abstraction:

```typescript
interface ProgressStore {
  getGameProgress(gameId: string): Promise<GameProgress | null>;
  saveGameProgress(progress: GameProgress): Promise<void>;
  resetGameProgress(gameId: string): Promise<void>;
}
```

MVP:

```text
LocalProgressStore
        ↓
   localStorage
```

Future:

```text
SupabaseProgressStore
        ↓
     Supabase
        ↓
Authenticated User
        ↓
Cloud Progress
```

This should allow the platform to introduce login and cross device progress later without rewriting the games.

## 11. Technology

Use:

* React
* TypeScript
* Vite
* Tailwind CSS
* localStorage
* GitHub Pages

The application must work as a static site.

Do not introduce a backend for the MVP.

## 12. Repository Structure

Suggested structure:

```text
stavion-labs/
│
├── src/
│   ├── games/
│   │   ├── git-quest/
│   │   │   ├── missions/
│   │   │   ├── engine.ts
│   │   │   ├── validation.ts
│   │   │   └── game.ts
│   │   │
│   │   ├── sql-detective/
│   │   └── iceberg-rescue/
│   │
│   ├── platform/
│   │   ├── game-registry.ts
│   │   ├── progress/
│   │   ├── scoring/
│   │   └── achievements/
│   │
│   ├── components/
│   ├── pages/
│   └── app/
│
├── public/
└── README.md
```

## 13. Important Architecture Principle

**Build a game platform, not a Git game.**

Git Quest is the first game and should be the reference implementation.

Adding a future game such as SQL Detective should primarily involve creating:

```text
games/sql-detective/
```

and registering it with the platform.

The landing page, game navigation, progress system, scoring framework and future authentication architecture should not need to be rewritten.

## 14. MVP Acceptance Criteria

The MVP is complete when:

1. Stavion Labs has a polished landing page.
2. Users can browse interactive learning games.
3. Git Quest is fully playable.
4. Git Quest contains multiple progressive missions.
5. Git operations are simulated safely in the browser.
6. Users learn through interaction rather than reading lessons.
7. The game provides scoring, XP, hints and achievements.
8. Progress survives browser refresh.
9. Users can reset their progress.
10. No login is required.
11. No backend is required.
12. The application deploys to GitHub Pages.
13. Game content is separated from the platform engine.
14. A second game can be added without modifying the core architecture.
15. Persistence can later be switched from localStorage to Supabase.
16. The UI works on desktop and mobile.

## 15. Product Direction

Stavion Labs should eventually become a collection of **small, focused engineering games**.

Examples:

**SQL Detective**

Investigate a broken analytics query and discover why the numbers are wrong.

**Iceberg Rescue**

A data lake is running out of storage and queries are becoming slow. Optimize partitions, files and table maintenance to keep the platform healthy.

**Pipeline Wars**

Operate a data pipeline while balancing latency, reliability and cost.

**System Design Arena**

Design a system under changing traffic, reliability and cost constraints.

**Git Quest**

Manage a repository through realistic engineering scenarios.

The common principle is:

> **Don't teach the user first. Give them a problem, let them try, then teach them from the outcome.**
