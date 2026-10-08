import { Fragment, useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, CircleHelp, Clock3, Command,
  CornerDownLeft, Flame, GitBranch, LockKeyhole, RotateCcw, ShieldCheck,
  TerminalSquare, Trophy, Zap,
} from "lucide-react";
import {
  getMissionRun, submitMissionCommand, useMissionHint,
} from "../../games/git-quest/engine";
import type { GameDefinition, GameProgress, Mission } from "../types";

interface GitQuestScreenProps {
  game: GameDefinition;
  mission: Mission;
  progress: GameProgress;
  onProgress: (progress: GameProgress) => void;
  onMissionSelect: (missionId: string) => void;
  onBack: () => void;
  onReset: () => void;
}

export function GitQuestScreen({
  game, mission, progress, onProgress, onMissionSelect, onBack, onReset,
}: GitQuestScreenProps) {
  const [command, setCommand] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [output, setOutput] = useState("");
  const [outputTone, setOutputTone] = useState<"success" | "error" | "neutral">("neutral");
  const [hint, setHint] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [executedCommands, setExecutedCommands] = useState<{ command: string; accepted: boolean }[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const commandInput = useRef<HTMLInputElement>(null);

  const missionIndex = game.missions.findIndex((item) => item.id === mission.id);
  const isSqlGame = game.id === "sql-detective";
  const run = getMissionRun(progress, mission);
  const currentBranch = [...(mission.branchProgression ?? [])]
    .filter((entry) => run.stepIndex >= entry.afterStep)
    .slice(-1)[0]?.branch ?? mission.branch ?? "main";
  const repositoryLines = [...(mission.repositorySnapshots ?? [])]
    .filter((snapshot) => run.stepIndex >= snapshot.afterStep)
    .slice(-1)[0]?.lines ?? mission.repository;
  const step = mission.steps[run.stepIndex];
  const isComplete = progress.completedMissions.includes(mission.id);
  const allComplete = progress.completedMissions.length === game.missions.length;
  const nextMission = game.missions[missionIndex + 1];
  useEffect(() => {
    setCommand("");
    setSelectedChoice("");
    setOutput("");
    setHint("");
    setCommandHistory([]);
    setExecutedCommands([]);
    setHistoryPointer(-1);
  }, [mission.id]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = command.trim();
    if (!trimmed || !step) return;

    const result = submitMissionCommand(progress, mission, trimmed, missionIndex, game.missions.length, selectedChoice || undefined);
    onProgress(result.progress);
    setCommandHistory((history) => [trimmed, ...history]);
    setExecutedCommands((history) => [...history, { command: trimmed, accepted: result.accepted }].slice(-6));
    setHistoryPointer(-1);
    setCommand("");
    if (result.accepted) setSelectedChoice("");
    setHint("");
    setOutput(result.message);
    setOutputTone(result.accepted ? "success" : "error");
  }

  function handleCommandKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    if (event.key === "ArrowUp") {
      const next = Math.min(historyPointer + 1, commandHistory.length - 1);
      setHistoryPointer(next);
      setCommand(commandHistory[next] ?? "");
    } else if (historyPointer > 0) {
      const next = historyPointer - 1;
      setHistoryPointer(next);
      setCommand(commandHistory[next] ?? "");
    } else {
      setHistoryPointer(-1);
      setCommand("");
    }
  }

  function showHint() {
    const result = useMissionHint(progress, mission);
    onProgress(result.progress);
    setHint(result.hint);
  }

  function chooseMission(target: Mission, index: number) {
    const done = progress.completedMissions.includes(target.id);
    if (!done && index > progress.currentMission) return;
    onMissionSelect(target.id);
  }

  function continueMission() {
    if (nextMission) onMissionSelect(nextMission.id);
  }

  if (allComplete) {
    return (
      <main className="page-wrap victory-page">
        <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> All games</button>
        <section className="victory-card">
          <div className="victory-orbit"><Trophy size={34} /></div>
          <div className="eyebrow"><span className="pulse-dot" /> {game.title.toUpperCase()} / CLEARED</div>
          <h1>{isSqlGame ? "Case closed." : "History made."}</h1>
          <p>{isSqlGame
            ? "You investigated datasets from basic filters to expert query patterns. The real skill is understanding what a query returns—and why."
            : "You handled the whole repo—from your first commit to the production incident. The real skill is knowing why the safe move is safe."}</p>
          <div className="victory-stats">
            <div><strong>{progress.score.toLocaleString()}</strong><span>FINAL SCORE</span></div>
            <div><strong>{progress.xp.toLocaleString()}</strong><span>TOTAL XP</span></div>
            <div><strong>{progress.achievements.length}</strong><span>BADGES EARNED</span></div>
          </div>
          <div className="victory-actions"><button className="button button-primary" onClick={onBack}>Explore more games <ArrowRight size={16} /></button><button className="button button-quiet" onClick={onReset}><RotateCcw size={15} /> Reset and replay</button></div>
        </section>
        <div className="victory-note"><ShieldCheck size={17} /><span>{isSqlGame
          ? "Every query used simulated sample data. No live database was connected or changed."
          : "Every command stayed inside the simulation. Your real files were never touched."}</span></div>
      </main>
    );
  }

  const runDone = run.stepIndex >= mission.steps.length;
  const hintUsed = step ? run.hintedStepIds?.includes(step.id) ?? false : true;
  const missionProgress = Math.round((progress.completedMissions.length / game.missions.length) * 100);

  return (
    <main className="game-page page-wrap">
      <div className="game-topline">
        <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Game library</button>
        <div className="breadcrumbs"><span>STAVION LABS</span><ChevronRight size={13} /><span>{game.title.toUpperCase()}</span><ChevronRight size={13} /><strong>MISSION {String(missionIndex + 1).padStart(2, "0")}</strong></div>
        <button className="topline-reset" onClick={onReset}><RotateCcw size={14} /> Reset</button>
      </div>

      <div className="game-layout">
        <aside className="quest-sidebar">
          <div className="quest-sidebar-head">
            <span className="mini-git-logo"><Command size={17} /></span>
            <div><strong>{game.title.toUpperCase()}</strong><span>{isSqlGame ? "THE QUERY LAB" : "THE REPOSITORY RUN"}</span></div>
          </div>
          <div className="sidebar-progress">
            <div className="sidebar-progress-copy"><span>MISSION PROGRESS</span><strong>{progress.completedMissions.length}<span> / {game.missions.length}</span></strong></div>
            <div className="progress-track"><span style={{ width: `${missionProgress}%` }} /></div>
          </div>
          <div className="mission-nav-label">THE RUN <span>{String(game.missions.length).padStart(2, "0")}</span></div>
          <nav className="mission-nav" aria-label={`${game.title} missions`}>
            {game.missions.map((item, index) => {
              const done = progress.completedMissions.includes(item.id);
              const locked = !done && index > progress.currentMission;
              const active = item.id === mission.id;
              return (
                <Fragment key={item.id}>
                  {(index === 0 || game.missions[index - 1].difficulty !== item.difficulty)
                    && <div className="mission-tier-label">{item.difficulty}</div>}
                  <button
                    className={`mission-nav-item ${active ? "selected" : ""} ${done ? "mission-nav-done" : ""} ${locked ? "mission-nav-locked" : ""}`}
                    onClick={() => chooseMission(item, index)}
                    disabled={locked}
                    aria-current={active ? "step" : undefined}
                    title={locked ? "Complete the previous mission to unlock" : item.title}
                  >
                    <span className="mission-nav-index">{done ? <Check size={14} /> : locked ? <LockKeyhole size={12} /> : String(index + 1).padStart(2, "0")}</span>
                    <span className="mission-nav-title">{item.title}</span>
                    {active && <span className="mission-nav-active-dot" />}
                  </button>
                </Fragment>
              );
            })}
          </nav>
          <div className="sidebar-save"><span className="online-dot" /> PROGRESS SAVED LOCALLY</div>
        </aside>

        <section className="mission-workspace">
          <div className="mission-heading">
            <div>
              <div className="eyebrow">{mission.eyebrow}</div>
              <h1>{mission.title}<span className="title-period">.</span></h1>
              <p>{mission.summary}</p>
            </div>
            <div className="difficulty-chip"><span /> {mission.difficulty}</div>
          </div>

          <div className="objective-card">
            <div className="objective-header"><span className="objective-symbol"><TargetIcon /></span><span>YOUR OBJECTIVE</span><span className="objective-step">STEP {Math.min(run.stepIndex + 1, mission.steps.length)} / {mission.steps.length}</span></div>
            <p>{isComplete || runDone ? mission.objective : step?.objective}</p>
          </div>

          <div className="workspace-grid">
            <section className="repo-panel panel">
              <div className="panel-heading"><div>{isSqlGame ? <Code2Icon /> : <GitBranch size={15} />}<span>{isSqlGame ? "DATABASE" : "REPOSITORY"}</span></div>{!isSqlGame && <span className="repo-branch">{currentBranch} <span>▾</span></span>}</div>
              <div className="repo-body">
                <div className="repo-tree-row repo-tree-root"><span className="tree-connector">●</span><span>{isSqlGame ? "query-lab" : "git-quest"}</span><span className="tree-caption">{isSqlGame ? "SCHEMA & SAMPLE DATA" : "WORKING TREE"}</span></div>
                {repositoryLines.map((line, index) => {
                  const hasStatus = /^(?: M| D|\?\?|A |M |R )/.test(line);
                  const marker = hasStatus ? line.slice(0, 2).trim() : line.includes("❌") ? "!" : "·";
                  const content = hasStatus ? line.slice(2).trim() : line;
                  const stateClass = marker === "??" ? "file-untracked" : marker === "D" || marker === "!" ? "file-deleted" : "";
                  return <div className="repo-file-row" key={`${mission.id}-${index}`}>
                    <span className={`file-state ${stateClass}`}>{marker}</span>
                    <code>{content}</code>
                  </div>;
                })}
                <div className="repo-bottomline"><span><span className="online-dot" /> {isSqlGame ? "SIMULATED DATASET" : "SIMULATED REPOSITORY"}</span><span>{isSqlGame ? "NO DATABASE CONNECTED" : "NO REAL FILES TOUCHED"}</span></div>
              </div>
            </section>

            <section className="mission-data">
              <div className="data-panel panel"><span className="tiny-label">REWARD</span><div className="data-value"><Zap size={17} /> {mission.points} <span>XP</span></div><span className="data-foot">Earned on completion</span></div>
              <div className="data-panel panel"><span className="tiny-label">STREAK</span><div className="data-value"><Flame size={17} /> {progress.streak} <span>DAYS</span></div><span className="data-foot">Keep the run alive</span></div>
              <div className="data-panel panel"><span className="tiny-label">HINTS USED</span><div className="data-value"><CircleHelp size={17} /> {progress.hintsUsed}</div><span className="data-foot">−20 points each</span></div>
            </section>
          </div>

          <section className="terminal-panel panel">
            <div className="terminal-topbar">
              <div className="terminal-tab"><TerminalSquare size={15} /><span>{isSqlGame ? "SQL CONSOLE" : "TERMINAL"}</span><span className="terminal-tab-indicator" /></div>
              <div className="terminal-session"><span>{isSqlGame ? "sql" : "bash"}</span><span className="terminal-session-divider">·</span><span>{isSqlGame ? "query-lab" : "~/git-quest"}</span></div>
              <span className="terminal-sim-tag"><span className="online-dot" /> SIMULATION</span>
            </div>
            <div className="terminal-scroll">
              <div className="terminal-intro"><span>{isSqlGame ? "Stavion SQL Lab v1.0.0" : "Stavion Shell v1.0.0"}</span><span>{isSqlGame ? "PostgreSQL-style queries · simulated dataset only." : "Type a command to complete the mission step."}</span></div>
              {executedCommands.map(({ command: executed, accepted }, index) => (
                <div className="terminal-command-history" key={`${index}-${executed}`}>
                  <span className="history-prompt">$</span><code>{executed}</code>
                  <span className={accepted ? "history-result-ok" : "history-result-error"}>{accepted ? "accepted" : "not accepted"}</span>
                </div>
              ))}
              {step?.choices && !isComplete && (
                <fieldset className="resolution-choices">
                  <legend>What should the resolved file contain?</legend>
                  {step.choices.map((choice) => (
                    <label className={`resolution-choice ${selectedChoice === choice.id ? "chosen" : ""}`} key={choice.id}>
                      <input type="radio" name="resolution-choice" value={choice.id} checked={selectedChoice === choice.id} onChange={() => setSelectedChoice(choice.id)} />
                      <code>{choice.label}</code>
                    </label>
                  ))}
                </fieldset>
              )}
              {output ? (
                <div className={`terminal-message terminal-message-${outputTone}`}><span className="message-prefix">{outputTone === "success" ? "✓" : "!"}</span><span>{output}</span></div>
              ) : (isComplete || runDone) ? (
                <div className="terminal-message terminal-message-success"><Check size={16} /><span>Mission cleared. {progress.missionScores[mission.id] ? `Score: ${progress.missionScores[mission.id]} points.` : "Review the repository state before moving on."}</span></div>
              ) : null}
              {hint && <div className="terminal-hint"><span>HINT</span><p>{hint}</p></div>}
              {step && !isComplete && (
                <form className="command-form" onSubmit={handleSubmit}>
                  <label className="terminal-prompt" htmlFor="command-input"><span>{isSqlGame ? "sql" : "›"}</span></label>
                  <input
                    id="command-input"
                    ref={commandInput}
                    aria-label={isSqlGame ? "SQL query" : "Git command"}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder={isSqlGame ? "Write a SQL query…" : "Type a Git command…"}
                    value={command}
                    onChange={(event) => setCommand(event.target.value)}
                    onKeyDown={handleCommandKey}
                    autoFocus
                  />
                  <button className="execute-button" type="submit" disabled={!command.trim()}><span>Execute</span><CornerDownLeft size={14} /></button>
                </form>
              )}
            </div>
            <div className="terminal-footer"><span><span className="terminal-cursor" /> READY FOR INPUT</span><button className="hint-button" onClick={showHint} disabled={!step || hintUsed}><CircleHelp size={14} /> {hintUsed ? "Hint used" : "Need a hint?"}</button></div>
          </section>

          {(isComplete || runDone) && (
            <div className="mission-complete-bar">
              <div><span className="mission-complete-icon"><Check size={17} /></span><div><strong>Mission clear.</strong><span>{isComplete ? `+${progress.missionScores[mission.id] ?? 0} pts · ${progress.achievements.length} achievements earned` : "This mission was cleared earlier."}</span></div></div>
              {nextMission
                ? <button className="button button-primary" onClick={continueMission}>Next mission <ArrowRight size={15} /></button>
                : <button className="button button-primary" onClick={onBack}>Finish run <Trophy size={15} /></button>}
            </div>
          )}

          <div className="game-bottomline">
            <span><ShieldCheck size={14} /> SAFE MODE: {isSqlGame ? "QUERIES CHECKED, NEVER EXECUTED" : "COMMANDS RUN IN THE SIMULATION ONLY"}</span>
            <span>SESSION SCORE <strong>{progress.score.toLocaleString()}</strong></span>
          </div>
        </section>
      </div>
      <p className="mobile-mission-help"><Clock3 size={13} /> {isSqlGame ? "Queries are checked against sample data. No database is connected." : "Commands are simulated. No shell or system access."}</p>
    </main>
  );
}

function Code2Icon() {
  return <span className="database-icon">SQL</span>;
}

function TargetIcon() {
  return <span className="target-icon"><span /></span>;
}
