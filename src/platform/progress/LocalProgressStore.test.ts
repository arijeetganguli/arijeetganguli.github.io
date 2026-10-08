import { beforeEach, describe, expect, it } from "vitest";
import { createFreshProgress, LocalProgressStore } from "./LocalProgressStore";

describe("LocalProgressStore", () => {
  let store: LocalProgressStore;

  beforeEach(() => {
    localStorage.clear();
    store = new LocalProgressStore();
  });

  it("saves and reloads game progress", async () => {
    const progress = { ...createFreshProgress("git-quest"), xp: 125, completedMissions: ["first-commit"] };
    await store.saveGameProgress(progress);

    await expect(store.getGameProgress("git-quest")).resolves.toEqual(progress);
  });

  it("keeps each registered game's progress separate", async () => {
    await store.saveGameProgress({ ...createFreshProgress("git-quest"), xp: 50 });
    await store.saveGameProgress({ ...createFreshProgress("sql-detective"), xp: 25 });

    await expect(store.getGameProgress("git-quest")).resolves.toMatchObject({ xp: 50 });
    await expect(store.getGameProgress("sql-detective")).resolves.toMatchObject({ xp: 25 });
  });

  it("resets one game without erasing another game's save", async () => {
    await store.saveGameProgress({ ...createFreshProgress("git-quest"), xp: 50 });
    await store.saveGameProgress({ ...createFreshProgress("sql-detective"), xp: 25 });
    await store.resetGameProgress("git-quest");

    await expect(store.getGameProgress("git-quest")).resolves.toBeNull();
    await expect(store.getGameProgress("sql-detective")).resolves.toMatchObject({ xp: 25 });
  });

  it("surfaces malformed persisted data instead of silently discarding it", async () => {
    localStorage.setItem("stavion-labs-progress-v1", "{");
    await expect(store.getGameProgress("git-quest")).rejects.toThrow();
  });
});
