import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";
import { localProgressStore } from "../progress/LocalProgressStore";

describe("Stavion Labs player flow", () => {
  beforeEach(() => localStorage.clear());

  it("starts Git Quest, gives feedback, and persists the mission step", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: /start playing/i }));
    expect(await screen.findByRole("heading", { name: /First Commit/ })).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Git command" }), "git status");
    await user.click(screen.getByRole("button", { name: "Execute" }));
    expect(await screen.findByText(/No simulated change was made/i)).toBeInTheDocument();
    expect(screen.getByText("git status")).toBeInTheDocument();
    expect(screen.getByText("not accepted")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Git command" }), "git init");
    await user.click(screen.getByRole("button", { name: "Execute" }));
    expect(await screen.findByText(/Repository initialized\. Git can now track snapshots/i)).toBeInTheDocument();
    expect(screen.getByText("repository initialized", { exact: true })).toBeInTheDocument();

    await waitFor(() => {
      const save = JSON.parse(localStorage.getItem("stavion-labs-progress-v1") ?? "{}");
      expect(save["git-quest"].missionRuns["first-commit"].stepIndex).toBe(1);
    });
  });

  it("preserves saved player progress after a refresh", async () => {
    localStorage.setItem("stavion-labs-progress-v1", JSON.stringify({
      "git-quest": {
        gameId: "git-quest",
        currentMission: 2,
        completedMissions: ["first-commit", "missing-change"],
        score: 200,
        xp: 200,
        hintsUsed: 1,
        achievements: ["first-commit"],
        lastPlayedAt: "2026-10-07T12:00:00.000Z",
        streak: 2,
        lastPlayedDay: "2026-10-07",
        missionRuns: {},
        missionScores: { "first-commit": 100, "missing-change": 100 },
      },
    }));
    await expect(localProgressStore.getGameProgress("git-quest")).resolves.toMatchObject({
      currentMission: 2,
      completedMissions: ["first-commit", "missing-change"],
    });

    render(<App />);

    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "View player progress" }));
    expect(await screen.findByText("2/10")).toBeInTheDocument();
    expect(screen.getByText("FINAL SCORE").parentElement).toHaveTextContent("200");
  });

  it("rotates the landing banner to SQL Detective and launches that game", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole("region", { name: "Git Quest highlights" })).toHaveTextContent(/10\s*missions to master Git/);
    expect(screen.getByRole("region", { name: "Git Quest highlights" })).toHaveTextContent(/3\s*levels of Git challenges/);

    const sqlSlide = await screen.findByRole("button", { name: "Show SQL Detective banner" });
    await user.click(sqlSlide);

    expect(sqlSlide).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("region", { name: "SQL Detective highlights" })).toHaveTextContent(/16\s*SQL missions to solve/);
    expect(screen.getByRole("region", { name: "SQL Detective highlights" })).toHaveTextContent(/4\s*SQL skill tiers to master/);
    expect(screen.getByRole("region", { name: "SQL Detective highlights" })).toHaveTextContent("risk to real databases");
    expect(screen.getByRole("table", { name: "Sample revenue by category" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play featured SQL Detective mission" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Play featured SQL Detective mission" }));
    expect(await screen.findByRole("heading", { name: /Read the Customer File/ })).toBeInTheDocument();
  });

  it("shows Git Quest highlights by default", async () => {
    render(<App />);
    const highlights = await screen.findByRole("region", { name: "Git Quest highlights" });
    expect(highlights).toHaveTextContent(/10\s*missions to master Git/);
    expect(highlights).toHaveTextContent(/3\s*levels of Git challenges/);
    expect(highlights).toHaveTextContent("risk to real repositories");
  });

  it("opens SQL Detective, explains wrong queries, and saves SQL progress separately", async () => {
    localStorage.setItem("stavion-labs-progress-v1", JSON.stringify({
      "git-quest": {
        gameId: "git-quest",
        currentMission: 1,
        completedMissions: ["first-commit"],
        score: 100,
        xp: 100,
        hintsUsed: 0,
        achievements: ["first-commit"],
        lastPlayedAt: "",
        streak: 1,
        lastPlayedDay: "",
        missionRuns: {},
        missionScores: { "first-commit": 100 },
      },
    }));
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Play SQL Detective" }));
    expect(await screen.findByRole("heading", { name: /Read the Customer File/ })).toBeInTheDocument();
    expect(screen.getByText("BEGINNER / 01")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "SQL query" }), "SELECT * FROM customers;");
    await user.click(screen.getByRole("button", { name: "Execute" }));
    expect(await screen.findByText(/SELECT \* returns every column/i)).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "SQL query" }), "SELECT name, email FROM customers;");
    await user.click(screen.getByRole("button", { name: "Execute" }));

    await waitFor(() => {
      const save = JSON.parse(localStorage.getItem("stavion-labs-progress-v1") ?? "{}");
      expect(save["git-quest"].completedMissions).toEqual(["first-commit"]);
      expect(save["sql-detective"].missionRuns["sql-select-columns"].stepIndex).toBe(1);
    });
    expect(await screen.findByText(/avoiding unnecessary customer data/i)).toBeInTheDocument();
  });

  it("switches games from My progress and displays each game's separate save", async () => {
    localStorage.setItem("stavion-labs-progress-v1", JSON.stringify({
      "git-quest": {
        gameId: "git-quest",
        currentMission: 1,
        completedMissions: ["first-commit"],
        score: 85,
        xp: 85,
        hintsUsed: 0,
        achievements: ["first-commit"],
        lastPlayedAt: "",
        streak: 1,
        lastPlayedDay: "",
        missionRuns: {},
        missionScores: { "first-commit": 85 },
      },
      "sql-detective": {
        gameId: "sql-detective",
        currentMission: 2,
        completedMissions: ["sql-select-columns"],
        score: 85,
        xp: 85,
        hintsUsed: 0,
        achievements: [],
        lastPlayedAt: "",
        streak: 1,
        lastPlayedDay: "",
        missionRuns: {},
        missionScores: { "sql-select-columns": 85 },
      },
    }));
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "View player progress" }));

    expect(await screen.findByText("Git Quest", { selector: ".progress-game-option-copy strong" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Git Quest progress" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1/10")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View SQL Detective progress" }));
    expect(screen.getByRole("button", { name: "View SQL Detective progress" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1/16")).toBeInTheDocument();
    expect(screen.getByText("SQL DETECTIVE")).toBeInTheDocument();
    expect(screen.getByText("Read the Customer File")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View Git Quest progress" }));
    expect(screen.getByText("1/10")).toBeInTheDocument();
    expect(screen.getByText("First Commit", { selector: ".mission-log-row span:nth-child(2)" })).toBeInTheDocument();
  });

  it("requires the accepted choice before resolving a conflict", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: /start playing/i }));

    for (const command of ["git init", "git add README.md", 'git commit -m "Initial commit"']) {
      await user.type(screen.getByRole("textbox", { name: "Git command" }), command);
      await user.click(screen.getByRole("button", { name: "Execute" }));
    }
    await user.click(await screen.findByRole("button", { name: /next mission/i }));

    for (const command of ["git status", "git add src/checkout.ts", 'git commit -m "Fix checkout validation"']) {
      await user.type(screen.getByRole("textbox", { name: "Git command" }), command);
      await user.click(screen.getByRole("button", { name: "Execute" }));
    }
    await user.click(await screen.findByRole("button", { name: /next mission/i }));

    for (const command of ["git switch -c feature/dark-mode", "git add src/theme.css", 'git commit -m "Add dark theme"']) {
      await user.type(screen.getByRole("textbox", { name: "Git command" }), command);
      await user.click(screen.getByRole("button", { name: "Execute" }));
    }
    await user.click(await screen.findByRole("button", { name: /next mission/i }));

    for (const command of ["git switch main", "git merge feature/profile"]) {
      await user.type(screen.getByRole("textbox", { name: "Git command" }), command);
      await user.click(screen.getByRole("button", { name: "Execute" }));
    }
    await user.click(await screen.findByRole("button", { name: /next mission/i }));

    await user.click(screen.getByRole("radio", { name: /timeout = 30/i }));
    await user.type(screen.getByRole("textbox", { name: "Git command" }), "git add config/payment.ts");
    await user.click(screen.getByRole("button", { name: "Execute" }));
    expect(await screen.findByText(/agreed product behavior is 60 seconds/i)).toBeInTheDocument();
    expect(screen.getByText("STEP 1 / 2")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /timeout = 60/i }));
    await user.type(screen.getByRole("textbox", { name: "Git command" }), "git add config/payment.ts");
    fireEvent.submit(screen.getByRole("textbox", { name: "Git command" }).closest("form")!);
    expect(await screen.findByText(/The agreed behavior is staged/i)).toBeInTheDocument();
  });
});
