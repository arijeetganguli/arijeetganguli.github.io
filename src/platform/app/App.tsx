import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Code2, Flame, Gamepad2, RotateCcw, Trophy, Zap } from "lucide-react";
import { getGame, gameRegistry } from "../game-registry";
import { createFreshProgress, localProgressStore } from "../progress/LocalProgressStore";
import type { GameProgress } from "../types";
import { GitQuestScreen } from "./GitQuestScreen";

type View = "home" | "game" | "progress";

const LEVELS = [
  { min: 0, name: "New Clone" },
  { min: 180, name: "Branch Scout" },
  { min: 450, name: "Merge Maker" },
  { min: 800, name: "Conflict Solver" },
  { min: 1250, name: "Release Guardian" },
  { min: 1750, name: "Git Survivor" },
];

const ACHIEVEMENTS = [
  { id: "first-commit", title: "First Commit", detail: "Save your first snapshot.", icon: "01" },
  { id: "branch-master", title: "Branch Master", detail: "Ship work on an isolated branch.", icon: "⌁" },
  { id: "conflict-resolver", title: "Conflict Resolver", detail: "Resolve a real collaboration conflict.", icon: "⫶" },
  { id: "history-detective", title: "History Detective", detail: "Recover a known-good version.", icon: "⌕" },
  { id: "git-survivor", title: "Git Survivor", detail: "Bring a production incident under control.", icon: "✳" },
  { id: "git-master", title: "Git Master", detail: "Complete every Git Quest mission.", icon: "★" },
  { id: "sql-beginner", title: "Query Starter", detail: "Clear every SQL beginner mission.", icon: "01" },
  { id: "sql-intermediate", title: "Join Investigator", detail: "Clear every SQL intermediate mission.", icon: "02" },
  { id: "sql-advanced", title: "Window Specialist", detail: "Clear every SQL advanced mission.", icon: "03" },
  { id: "sql-expert", title: "Database Expert", detail: "Clear every SQL expert mission.", icon: "04" },
  { id: "sql-master", title: "SQL Detective", detail: "Complete all SQL Detective missions.", icon: "★" },
];

function levelFor(xp: number, gameId: string) {
  const index = LEVELS.reduce((level, item, itemIndex) => (xp >= item.min ? itemIndex : level), 0);
  const sqlRanks = ["Query Rookie", "Filter Finder", "Join Analyst", "Query Builder", "Data Detective", "SQL Master"];
  return {
    ...LEVELS[index],
    name: gameId === "sql-detective" ? sqlRanks[index] : LEVELS[index].name,
    number: index + 1,
    next: LEVELS[index + 1],
  };
}

function App() {
  const [activeGameId, setActiveGameId] = useState("git-quest");
  const game = getGame(activeGameId);
  const [progressByGame, setProgressByGame] = useState<Record<string, GameProgress>>(() => ({
    "git-quest": createFreshProgress("git-quest"),
    "sql-detective": createFreshProgress("sql-detective"),
  }));
  const [progress, setProgress] = useState<GameProgress>(() => createFreshProgress("git-quest"));
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [view, setView] = useState<View>("home");
  const [selectedMissionId, setSelectedMissionId] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all(gameRegistry.filter((item) => item.status === "available").map(async (item) => ({
      gameId: item.id,
      saved: await localProgressStore.getGameProgress(item.id),
    })))
      .then((saves) => {
        if (!mounted) return;
        const loaded = Object.fromEntries(saves.map(({ gameId, saved }) => [
          gameId,
          saved ? { ...createFreshProgress(gameId), ...saved } : createFreshProgress(gameId),
        ]));
        setProgressByGame(loaded);
        setProgress(loaded["git-quest"]);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setLoadError(error instanceof Error ? error.message : "Saved game progress could not be loaded.");
        setIsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const persist = useCallback((next: GameProgress) => {
    setProgress(next);
    setProgressByGame((current) => ({ ...current, [next.gameId]: next }));
    setSaveError("");
    void localProgressStore.saveGameProgress(next).catch((error: unknown) => {
      setSaveError(error instanceof Error ? error.message : "Progress could not be saved to this browser.");
    });
  }, []);

  if (!game) return <main className="fatal-message">{activeGameId} is missing from the game registry.</main>;
  const currentLevel = levelFor(progress.xp, game.id);
  const mission = game.missions.find((item) => item.id === selectedMissionId) ??
    game.missions[Math.min(progress.currentMission, game.missions.length - 1)];
  const percentToNext = currentLevel.next
    ? Math.round(((progress.xp - currentLevel.min) / (currentLevel.next.min - currentLevel.min)) * 100)
    : 100;

  async function resetProgress() {
    try {
      await localProgressStore.resetGameProgress(activeGameId);
      const fresh = createFreshProgress(activeGameId);
      setProgress(fresh);
      setProgressByGame((current) => ({ ...current, [activeGameId]: fresh }));
      setSelectedMissionId("");
      setShowResetConfirm(false);
      setSaveError("");
      setView("home");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Progress could not be reset.");
    }
  }

  function startQuest(gameId = "git-quest") {
    const nextGame = getGame(gameId);
    if (!nextGame || nextGame.status !== "available") return;
    const nextProgress = progressByGame[gameId] ?? createFreshProgress(gameId);
    setActiveGameId(gameId);
    setProgress(nextProgress);
    setSelectedMissionId(nextGame.missions[Math.min(nextProgress.currentMission, nextGame.missions.length - 1)].id);
    setView("game");
  }

  function selectProgressGame(gameId: string) {
    const nextGame = getGame(gameId);
    if (!nextGame || nextGame.status !== "available") return;
    setActiveGameId(gameId);
    setProgress(progressByGame[gameId] ?? createFreshProgress(gameId));
  }

  function navigate(nextView: View) {
    setView(nextView);
    if (nextView !== "game") setSelectedMissionId("");
  }

  if (isLoading) {
    return <main className="loading-screen"><span className="brand-mark">S</span><p>Loading your save file…</p></main>;
  }

  if (loadError) {
    return (
      <main className="loading-screen">
        <span className="brand-mark">!</span>
        <h1>Save file unavailable</h1>
        <p>{loadError}</p>
        <button className="button button-quiet" onClick={() => window.location.reload()}>Reload app</button>
      </main>
    );
  }

  return (
    <div className="app-frame">
      <div className="ambient-grid" aria-hidden="true" />
      <header className="topbar">
        <div className="topbar-inner">
          <button className="wordmark" onClick={() => navigate("home")} aria-label="Stavion Labs home">
            <span className="brand-mark">S</span><span>stavion<span className="wordmark-accent">labs</span></span>
          </button>
          <nav className="main-nav" aria-label="Main navigation">
            <button className={view === "home" ? "active" : ""} onClick={() => navigate("home")}>Explore</button>
            <button className={view === "game" && activeGameId === "git-quest" ? "active" : ""} onClick={() => startQuest("git-quest")}>Git Quest</button>
            <button className={view === "game" && activeGameId === "sql-detective" ? "active" : ""} onClick={() => startQuest("sql-detective")}>SQL Detective</button>
            <button className={view === "progress" ? "active" : ""} onClick={() => navigate("progress")}>My progress</button>
          </nav>
          <button className="profile-pill" onClick={() => navigate("progress")} aria-label="View player progress">
            <span className="profile-level"><Zap size={13} /> LVL {currentLevel.number}</span>
            <span>{progress.xp.toLocaleString()} XP</span>
          </button>
        </div>
      </header>

      {saveError && (
        <div className="storage-alert" role="alert">
          <span>Progress save failed: {saveError}</span>
          <button onClick={() => setSaveError("")} aria-label="Dismiss save warning">×</button>
        </div>
      )}

      {view === "home" && (
        <HomePage games={gameRegistry} progressByGame={progressByGame} progress={progressByGame["git-quest"]} onStart={startQuest} />
      )}

      {view === "game" && (
        <GitQuestScreen
          game={game}
          mission={mission}
          progress={progress}
          onProgress={persist}
          onMissionSelect={setSelectedMissionId}
          onBack={() => navigate("home")}
          onReset={() => setShowResetConfirm(true)}
        />
      )}

      {view === "progress" && (
        <ProgressPage
          game={game}
          games={gameRegistry.filter((item) => item.status === "available")}
          progress={progress}
          progressByGame={progressByGame}
          missionCount={game.missions.length}
          percentToNext={percentToNext}
          currentLevel={currentLevel}
          onStart={() => startQuest(activeGameId)}
          onGameSelect={selectProgressGame}
          onReset={() => setShowResetConfirm(true)}
        />
      )}

      {showResetConfirm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowResetConfirm(false);
        }}>
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title">
            <span className="icon-tile"><RotateCcw size={19} /></span>
            <h2 id="reset-title">Reset this save?</h2>
            <p>Your mission progress, XP, score, streak, and achievements will be cleared from this browser.</p>
            <div className="dialog-actions">
              <button className="button button-quiet" onClick={() => setShowResetConfirm(false)}>Keep progress</button>
              <button className="button button-danger" onClick={() => void resetProgress()}>Reset game</button>
            </div>
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
}

interface HomePageProps {
  games: typeof gameRegistry;
  progressByGame: Record<string, GameProgress>;
  progress: GameProgress;
  onStart: (gameId?: string) => void;
}

function HomePage({ games, progressByGame, progress, onStart }: HomePageProps) {
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [pauseHeroRotation, setPauseHeroRotation] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (pauseHeroRotation || prefersReducedMotion) return;
    const interval = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % 2);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [activeHeroSlide, pauseHeroRotation]);

  return (
    <main>
      <section className="hero-section page-wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse-dot" /> TECHNICAL LEARNING, REWIRED</div>
          <h1>Learn tech<br /><span className="hero-highlight">by playing.</span></h1>
          <p className="hero-description">Real engineering problems. Hands-on missions. No lectures before the action.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => onStart("git-quest")}>
              {progress.completedMissions.length ? "Continue playing" : "Start playing"} <ArrowRight size={16} />
            </button>
            <a className="button button-quiet" href="#games"><Gamepad2 size={16} /> Explore games</a>
          </div>
          <div className="hero-social-proof">
            <span className="mini-avatar">G</span><span className="mini-avatar">S</span><span className="mini-avatar">+</span>
            <span>Built for curious engineers</span>
          </div>
        </div>
        <section
          className="hero-art"
          aria-label="Featured learning missions"
          aria-roledescription="carousel"
          onMouseEnter={() => setPauseHeroRotation(true)}
          onMouseLeave={() => setPauseHeroRotation(false)}
        >
          <div className="art-topline">
            <span><span className="online-dot" /> {activeHeroSlide === 0 ? "LIVE REPOSITORY" : "LIVE QUERY LAB"}</span>
            <span>{activeHeroSlide === 0 ? "git-quest / main" : "sql-detective / postgres"}</span>
          </div>
          {activeHeroSlide === 0 ? (
            <div className="art-code" aria-label="Git commit graph illustration">
              <div className="commit-row"><span className="commit-line green-line" /><span className="commit-dot current" /><span className="commit-hash">a7f2c1e</span><span className="commit-message">merge: payment flow</span><span className="branch-chip">main</span></div>
              <div className="commit-row"><span className="commit-line green-line" /><span className="commit-dot" /><span className="commit-hash">91bd120</span><span className="commit-message">fix: timeout edge case</span></div>
              <div className="commit-row"><span className="commit-line split-line" /><span className="commit-dot" /><span className="commit-hash">5cc8fa1</span><span className="commit-message">feat: checkout validation</span></div>
              <div className="commit-row"><span className="commit-line split-line" /><span className="commit-dot branch-dot" /><span className="commit-hash">d3100b2</span><span className="commit-message">feat: payment form</span><span className="branch-chip muted-chip">feature</span></div>
              <div className="commit-row"><span className="commit-line" /><span className="commit-dot" /><span className="commit-hash">30fe820</span><span className="commit-message">chore: release 2.4.0</span></div>
            </div>
          ) : (
            <div className="sql-hero-preview" aria-label="SQL query and results illustration">
              <div className="sql-hero-query">
                <div><span>01</span><code><b>SELECT</b> category, <b>SUM</b>(revenue)</code></div>
                <div><span>02</span><code><b>FROM</b> orders</code></div>
                <div><span>03</span><code><b>WHERE</b> status = <i>'paid'</i></code></div>
                <div><span>04</span><code><b>GROUP BY</b> category</code></div>
              </div>
              <div className="sql-hero-results" role="table" aria-label="Sample revenue by category">
                <div className="sql-hero-result sql-hero-result-head" role="row"><span role="columnheader">CATEGORY</span><span role="columnheader">REVENUE</span></div>
                <div className="sql-hero-result" role="row"><span role="cell">hardware</span><strong role="cell">$12,480</strong></div>
                <div className="sql-hero-result" role="row"><span role="cell">software</span><strong role="cell">$8,920</strong></div>
                <div className="sql-hero-result" role="row"><span role="cell">services</span><strong role="cell">$6,350</strong></div>
              </div>
            </div>
          )}
          <div className="art-footer">
            <div><span className="tiny-label">QUEST STATUS</span><strong><span className="online-dot" /> {activeHeroSlide === 0 ? "Changes approved" : "Revenue query verified"}</strong></div>
            <div className="art-xp"><Zap size={15} /> {activeHeroSlide === 0 ? "+120 XP" : "+190 XP"}</div>
          </div>
          <div className="hero-banner-controls" role="group" aria-label="Choose featured game">
            <button type="button" aria-label="Show Git Quest banner" className={activeHeroSlide === 0 ? "active" : ""} aria-pressed={activeHeroSlide === 0} onClick={() => setActiveHeroSlide(0)}>
              <span /> Git Quest
            </button>
            <button type="button" aria-label="Show SQL Detective banner" className={activeHeroSlide === 1 ? "active" : ""} aria-pressed={activeHeroSlide === 1} onClick={() => setActiveHeroSlide(1)}>
              <span /> SQL Detective
            </button>
            <button className="hero-banner-play" aria-label={`Play featured ${activeHeroSlide === 0 ? "Git Quest" : "SQL Detective"} mission`} onClick={() => onStart(activeHeroSlide === 0 ? "git-quest" : "sql-detective")}>
              Play {activeHeroSlide === 0 ? "Git Quest" : "SQL Detective"} <ArrowRight size={13} />
            </button>
          </div>
          <div className="art-corner">{activeHeroSlide === 0 ? "GIT QUEST / MISSION 04" : "SQL DETECTIVE / ADVANCED 01"}</div>
        </section>
      </section>

      <section className="signal-strip" aria-label={`${activeHeroSlide === 0 ? "Git Quest" : "SQL Detective"} highlights`}>
        <div><span className="signal-number">{activeHeroSlide === 0 ? "10" : "16"}</span><span>{activeHeroSlide === 0 ? "missions to master Git" : "SQL missions to solve"}</span></div>
        <span className="signal-separator" />
        <div><span className="signal-number">{activeHeroSlide === 0 ? "3" : "4"}</span><span>{activeHeroSlide === 0 ? "levels of Git challenges" : "SQL skill tiers to master"}</span></div>
        <span className="signal-separator" />
        <div><span className="signal-number">0</span><span>{activeHeroSlide === 0 ? "risk to real repositories" : "risk to real databases"}</span></div>
      </section>

      <section className="catalogue-section page-wrap" id="games">
        <div className="section-heading">
          <div><div className="eyebrow">THE PLAYGROUND</div><h2>Choose your next challenge.</h2></div>
          <p>Small, focused games. Practical skills you can use tomorrow.</p>
        </div>
        <div className="game-grid">
          {games.map((game) => {
            const gameProgress = progressByGame[game.id];
            const gamePercent = gameProgress && game.missions.length
              ? Math.round(gameProgress.completedMissions.length / game.missions.length * 100)
              : 0;
            const isAvailable = game.status === "available";
            return (
              <article className={`game-card ${isAvailable ? "game-card-live" : "game-card-soon"}`} key={game.id}>
                <div className="game-card-top">
                  <span className={`game-icon ${isAvailable ? "game-icon-live" : ""}`}>{game.icon}</span>
                  <span className={`status-chip ${game.status === "available" ? "status-live" : ""}`}>
                    <span className="online-dot" />{game.status === "available" ? "AVAILABLE" : "IN DEVELOPMENT"}
                  </span>
                </div>
                <div className="game-meta">{game.category} <span>/</span> {game.difficulty}</div>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div className="game-card-footer">
                  <span>{game.estimatedMinutes} MIN <span className="meta-divider">·</span> {game.missions.length || "SOON"} {game.missions.length ? "MISSIONS" : ""}</span>
                  {isAvailable ? (
                    <button className="card-action" onClick={() => onStart(game.id)} aria-label={`Play ${game.title}`}>
                      {gameProgress?.completedMissions.length ? `${gamePercent}%` : "Play"} <ArrowRight size={15} />
                    </button>
                  ) : <span className="coming-label">COMING SOON</span>}
                </div>
                {isAvailable && gamePercent > 0 && <div className="card-progress"><span style={{ width: `${gamePercent}%` }} /></div>}
              </article>
            );
          })}
        </div>
      </section>

      <section className="manifesto-section page-wrap">
        <div className="manifesto-mark">“</div>
        <div><div className="eyebrow">THE STAVION METHOD</div><h2>Don’t read the manual.<br /><span className="hero-highlight">Run the mission.</span></h2></div>
        <p>Try something. See what happens. Understand why it worked—or how to recover when it didn’t. That’s learning built for the real world.</p>
      </section>
    </main>
  );
}

interface ProgressPageProps {
  game: NonNullable<ReturnType<typeof getGame>>;
  games: typeof gameRegistry;
  progress: GameProgress;
  progressByGame: Record<string, GameProgress>;
  missionCount: number;
  percentToNext: number;
  currentLevel: ReturnType<typeof levelFor>;
  onStart: () => void;
  onGameSelect: (gameId: string) => void;
  onReset: () => void;
}

function ProgressPage({
  game, games, progress, progressByGame, missionCount, percentToNext, currentLevel, onStart, onGameSelect, onReset,
}: ProgressPageProps) {
  const completion = Math.round((progress.completedMissions.length / missionCount) * 100);
  const achievements = ACHIEVEMENTS.filter((item) => item.id.startsWith("sql-") === (game.id === "sql-detective"));
  return (
    <main className="page-wrap dashboard-page">
      <div className="dashboard-heading">
        <div><div className="eyebrow">PLAYER SAVE / LOCAL</div><h1>Your progress.</h1><p>Every mission cleared is a skill you can take to the real world.</p></div>
        <button className="button button-quiet" onClick={onStart}>Resume {game.title} <ArrowRight size={15} /></button>
      </div>
      <section className="progress-game-switcher" aria-label="Choose game progress">
        <div className="eyebrow">YOUR GAMES</div>
        <div className="progress-game-options">
          {games.map((item) => {
            const itemProgress = progressByGame[item.id] ?? createFreshProgress(item.id);
            const selected = item.id === game.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`progress-game-option ${selected ? "selected" : ""}`}
                onClick={() => onGameSelect(item.id)}
                aria-pressed={selected}
                aria-label={`View ${item.title} progress`}
              >
                <span className="progress-game-option-icon">{item.icon}</span>
                <span className="progress-game-option-copy">
                  <strong>{item.title}</strong>
                  <span>{itemProgress.completedMissions.length}/{item.missions.length} missions · {itemProgress.xp.toLocaleString()} XP</span>
                </span>
                {selected && <span className="progress-game-option-active">VIEWING</span>}
              </button>
            );
          })}
        </div>
      </section>
      <section className="level-card">
        <div className="level-card-head">
          <div className="level-emblem"><Zap size={22} /></div>
          <div><span className="tiny-label">CURRENT RANK</span><h2>{currentLevel.name}</h2></div>
          <div className="level-xp"><strong>{progress.xp.toLocaleString()}</strong><span>XP</span></div>
        </div>
        <div className="rank-progress"><div><span>LEVEL {currentLevel.number}</span><span>{currentLevel.next ? `${currentLevel.next.min - progress.xp} XP TO NEXT` : "MAX LEVEL"}</span></div><div className="progress-track"><span style={{ width: `${percentToNext}%` }} /></div></div>
      </section>
      <div className="stat-grid">
        <StatCard icon={<Trophy size={17} />} label="MISSIONS CLEARED" value={`${progress.completedMissions.length}/${missionCount}`} />
        <StatCard icon={<Code2 size={17} />} label="FINAL SCORE" value={progress.score.toLocaleString()} />
        <StatCard icon={<Flame size={17} />} label="DAY STREAK" value={`${progress.streak}`} />
        <StatCard icon={<Zap size={17} />} label="HINTS USED" value={`${progress.hintsUsed}`} />
      </div>
      <section className="achievement-section">
        <div className="section-heading compact-heading"><div><div className="eyebrow">COLLECTED PROOF</div><h2>Achievements</h2></div><span className="tag-count">{progress.achievements.length} / {achievements.length} UNLOCKED</span></div>
        <div className="achievement-grid">
          {achievements.map((achievement) => {
            const unlocked = progress.achievements.includes(achievement.id);
            return <article className={`achievement-card ${unlocked ? "unlocked" : "locked"}`} key={achievement.id}>
              <div className="achievement-icon">{achievement.icon}</div><div><h3>{achievement.title}</h3><p>{achievement.detail}</p></div><span className="achievement-state">{unlocked ? "UNLOCKED" : "LOCKED"}</span>
            </article>;
          })}
        </div>
      </section>
      <section className="mission-progress-section">
        <div className="section-heading compact-heading"><div><div className="eyebrow">{game.title.toUpperCase()}</div><h2>Mission log</h2></div><span className="tag-count">{completion}% COMPLETE</span></div>
        <div className="mission-log">
          {game.missions.map((mission, index) => {
            const done = progress.completedMissions.includes(mission.id);
            return <div className={`mission-log-row ${done ? "done" : ""}`} key={mission.id}>
              <span className="log-index">{done ? "✓" : String(index + 1).padStart(2, "0")}</span><span>{mission.title}</span><span>{done ? `+${progress.missionScores[mission.id] ?? 0} PTS` : "NOT CLEARED"}</span>
            </div>;
          })}
        </div>
      </section>
      <div className="dashboard-actions">
        <p>Your save stays in this browser. No account, no syncing, just your game.</p>
        <button className="text-button danger-text" onClick={onReset}><RotateCcw size={14} /> Reset {game.title} progress</button>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <article className="stat-card"><span className="stat-icon">{icon}</span><div><span className="tiny-label">{label}</span><strong>{value}</strong></div></article>;
}

function Footer() {
  return <footer className="site-footer"><div className="footer-inner"><button className="wordmark footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span className="brand-mark">S</span><span>stavion<span className="wordmark-accent">labs</span></span></button><span>Learn in the simulation. Ship with confidence.</span><span>© 2026 STAVION LABS</span></div></footer>;
}

export default App;
