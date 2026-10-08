import { describe, expect, it } from "vitest";
import { createFreshProgress } from "../../platform/progress/LocalProgressStore";
import { gitQuestMissions } from "./missions";
import {
  getMissionRun, normalizeCommand, submitMissionCommand, useMissionHint,
} from "./engine";

describe("Git Quest mission engine", () => {
  it("normalizes whitespace and casing without executing commands", () => {
    expect(normalizeCommand("  GIT   STATUS ")).toBe("git status");
  });

  it("moves step by step and awards a mission only once", () => {
    const mission = gitQuestMissions[0];
    let progress = createFreshProgress("git-quest");

    for (const [index, step] of mission.steps.entries()) {
      const result = submitMissionCommand(progress, mission, step.acceptedCommands[0], 0, 10);
      expect(result.accepted).toBe(true);
      expect(result.completedMission).toBe(index === mission.steps.length - 1);
      progress = result.progress;
    }

    expect(progress.completedMissions).toEqual(["first-commit"]);
    expect(progress.score).toBe(mission.points);
    expect(progress.xp).toBe(mission.points);
    expect(progress.currentMission).toBe(1);
    expect(progress.achievements).toContain("first-commit");

    const replay = submitMissionCommand(progress, mission, "git commit -m \"Initial commit\"", 0, 10);
    expect(replay.accepted).toBe(false);
    expect(replay.progress.score).toBe(progress.score);
    expect(replay.progress.xp).toBe(progress.xp);
  });

  it("does not advance after an incorrect command and applies a scoring penalty", () => {
    const mission = gitQuestMissions[0];
    const wrong = submitMissionCommand(createFreshProgress("git-quest"), mission, "git status", 0, 10);
    expect(wrong.accepted).toBe(false);
    expect(getMissionRun(wrong.progress, mission).stepIndex).toBe(0);
    expect(getMissionRun(wrong.progress, mission).incorrectAttempts).toBe(1);
  });

  it("charges for one hint per step and does not repeatedly charge the same hint", () => {
    const mission = gitQuestMissions[0];
    const initial = createFreshProgress("git-quest");
    const firstHint = useMissionHint(initial, mission);
    const repeatedHint = useMissionHint(firstHint.progress, mission);

    expect(firstHint.alreadyUsed).toBe(false);
    expect(repeatedHint.alreadyUsed).toBe(true);
    expect(repeatedHint.progress.hintsUsed).toBe(1);
  });

  it("requires the agreed resolution choice for the conflict mission", () => {
    const mission = gitQuestMissions.find((item) => item.id === "conflict");
    expect(mission).toBeDefined();
    let progress = createFreshProgress("git-quest");
    const step = mission!.steps[0];
    const wrong = submitMissionCommand(progress, mission!, step.acceptedCommands[0], 4, 10, "30");
    expect(wrong.accepted).toBe(false);
    expect(wrong.message).toContain("60 seconds");
    expect(getMissionRun(wrong.progress, mission!).stepIndex).toBe(0);

    progress = submitMissionCommand(wrong.progress, mission!, step.acceptedCommands[0], 4, 10, "60").progress;
    expect(getMissionRun(progress, mission!).stepIndex).toBe(1);
  });

  it("defines ten sequential missions with progressively higher difficulty", () => {
    expect(gitQuestMissions).toHaveLength(10);
    expect(gitQuestMissions[0].difficulty).toBe("Beginner");
    expect(gitQuestMissions[9].difficulty).toBe("Advanced");
    expect(gitQuestMissions.every((mission) => mission.steps.length > 0)).toBe(true);
  });

  it("supports a complete ten-mission run and unlocks the final achievement", () => {
    let progress = createFreshProgress("git-quest");
    gitQuestMissions.forEach((mission, missionIndex) => {
      mission.steps.forEach((step) => {
        const result = submitMissionCommand(
          progress,
          mission,
          step.acceptedCommands[0],
          missionIndex,
          gitQuestMissions.length,
          step.correctChoiceId,
        );
        expect(result.accepted).toBe(true);
        progress = result.progress;
      });
    });

    expect(progress.completedMissions).toHaveLength(10);
    expect(progress.currentMission).toBe(10);
    expect(progress.achievements).toContain("git-master");
    expect(progress.xp).toBeGreaterThan(0);
  });
});
