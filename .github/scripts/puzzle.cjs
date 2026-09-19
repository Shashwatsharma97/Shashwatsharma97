// Powers the "Daily Chess Puzzle" section of the profile README.
//
// Two ways this runs (see .github/workflows/puzzle.yml):
//  1. On a schedule (daily) or manual workflow_dispatch -> picks a fresh
//     random puzzle from chess/puzzle-bank.json and renders it.
//  2. On a new issue titled "puzzle: <id>: <letter>" (e.g. "puzzle: 6BQYc: B")
//     -> checks whether <letter> was the best move for puzzle <id> and
//     replies. Anyone can attempt, and can retry after a wrong guess — this
//     is a skill check, not a turn-based game, so there's no "wait your
//     turn" restriction like the old full-game version had.
//  Also: an issue titled exactly "puzzle: new" from the repo owner forces
//  a fresh puzzle on demand (handy for testing or if a puzzle goes stale).
//
// Puzzle data (chess/puzzle-bank.json) is a curated set of ~1000-rated
// puzzles pulled from the Lichess open puzzle database
// (database.lichess.org, CC0-licensed), filtered to single-best-move
// positions so they map cleanly onto a multiple-choice format.

const fs = require("fs");
const path = require("path");
const { Chess } = require("chess.js");
const { renderBoardSvg } = require("./board-svg.cjs");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const STATE_PATH = path.join(REPO_ROOT, "chess", "puzzle-state.json");
const BANK_PATH = path.join(REPO_ROOT, "chess", "puzzle-bank.json");
const BOARD_SVG_PATH = path.join(REPO_ROOT, "chess", "board.svg");
const README_PATH = path.join(REPO_ROOT, "README.md");

const REPO = process.env.REPO || "";
const MODE = process.env.MODE || "issue"; // "issue" | "scheduled"
const ISSUE_USER = process.env.ISSUE_USER || "someone";
const ISSUE_TITLE = (process.env.ISSUE_TITLE || "").trim();
const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT;

const THEME_LABELS = {
  mateIn1: "Mate in 1",
  crushing: "Winning tactic",
  advantage: "Winning advantage",
  defensiveMove: "Best defense",
  kingsideAttack: "Kingside attack",
  smotheredMate: "Smothered mate",
  hookMate: "Hook mate",
  blindSwineMate: "Rook-pair mate",
  queenEndgame: "Queen endgame",
  rookEndgame: "Rook endgame",
  opening: "Opening",
  middlegame: "Middlegame",
  endgame: "Endgame",
};

function pickThemeLabel(themes) {
  const priority = [
    "mateIn1",
    "smotheredMate",
    "hookMate",
    "blindSwineMate",
    "crushing",
    "advantage",
    "defensiveMove",
    "kingsideAttack",
  ];
  const primary = priority.find((t) => themes.includes(t));
  const phase = ["opening", "middlegame", "endgame", "queenEndgame", "rookEndgame"].find((t) =>
    themes.includes(t),
  );
  const parts = [primary, phase].filter(Boolean).map((t) => THEME_LABELS[t] || t);
  return parts.length ? parts.join(" · ") : "Tactics puzzle";
}

function loadJson(p, fallback) {
  if (fs.existsSync(p)) {
    try {
      return JSON.parse(fs.readFileSync(p, "utf8"));
    } catch {
      /* fall through */
    }
  }
  return fallback;
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
}

function setOutput(name, value) {
  if (!GITHUB_OUTPUT) return;
  const marker = `EOF_${Date.now()}`;
  fs.appendFileSync(GITHUB_OUTPUT, `${name}<<${marker}\n${value}\n${marker}\n`);
}

function finish(ok, message) {
  setOutput("ok", ok ? "true" : "false");
  setOutput("message", message);
  process.exit(0);
}

function issueLink(title) {
  const t = encodeURIComponent(title);
  const body = encodeURIComponent('Just click "Submit new issue" — nothing else needed.');
  return `https://github.com/${REPO}/issues/new?title=${t}&body=${body}`;
}

// --- Distractor (wrong option) generation ----------------------------------

function scoreMove(game, move) {
  let score = 0;
  if (move.captured) score += 2;
  const clone = new Chess(game.fen());
  clone.move(move.san);
  if (clone.inCheck()) score += 2;
  const centralFiles = "cdef";
  const centralRanks = "3456";
  if (centralFiles.includes(move.to[0]) && centralRanks.includes(move.to[1])) score += 1;
  return score;
}

function buildOptions(game, correctUci, correctSan) {
  const legal = game.moves({ verbose: true });
  const correctFrom = correctUci.slice(0, 2);
  const correctTo = correctUci.slice(2, 4);
  const distractPool = legal.filter((m) => !(m.from === correctFrom && m.to === correctTo));

  const scored = distractPool
    .map((m) => ({ m, score: scoreMove(game, m) + Math.random() * 0.5 }))
    .sort((a, b) => b.score - a.score);

  const distractors = scored.slice(0, 3).map(({ m }) => ({ uci: m.from + m.to, san: m.san }));
  const options = [{ uci: correctUci, san: correctSan }, ...distractors];

  // Fisher-Yates shuffle so the correct answer isn't always first.
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  const letters = ["A", "B", "C", "D"];
  return options.map((o, i) => ({ letter: letters[i], ...o }));
}

// --- README rendering -------------------------------------------------------

function renderOutputs(state) {
  const game = new Chess(state.fen);
  const svg = renderBoardSvg(game, {});
  fs.mkdirSync(path.dirname(BOARD_SVG_PATH), { recursive: true });
  fs.writeFileSync(BOARD_SVG_PATH, svg);

  const optionsTable = state.options
    .map((o) => `| **${o.letter}** | [${o.san}](${issueLink(`puzzle: ${state.puzzleId}: ${o.letter}`)}) |`)
    .join("\n");

  const solvedCount = (state.solvedBy || []).length;
  const leaderboard =
    Object.entries(state.allTimeLeaderboard || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([user, count]) => `| ${count} | [@${user}](https://github.com/${user}) |`)
      .join("\n") || "| — | no solves yet |";

  const side = state.turn === "w" ? "White" : "Black";
  const cacheBust = Date.now();
  const boardUrl = `https://raw.githubusercontent.com/${REPO}/main/chess/board.svg?v=${cacheBust}`;

  const section = `<!-- CHESS:START -->
### 🧩 Daily Chess Puzzle (~${state.rating} Elo)

**${state.themeLabel}** &middot; **${side} to move.** Which move is best?

<div align="center">
<img src="${boardUrl}" alt="chess puzzle board" width="480" />
</div>

| Option | Move — click if you think this is it |
|---|---|
${optionsTable}

${solvedCount} ${solvedCount === 1 ? "person has" : "people have"} solved this one so far.

<details>
<summary><b>How this works · leaderboard</b></summary>

Pick the move you think is best — clicking it opens a pre-filled GitHub
Issue, just hit **Submit new issue**. A GitHub Action checks it instantly,
tells you if you were right, and closes the issue. Guess wrong? Come back
and try again, no penalty. A fresh puzzle is picked automatically once a day.

Puzzles are real, rated positions from the
[Lichess open puzzle database](https://database.lichess.org/#puzzles) (CC0),
filtered to ones with a single clear best move around 1000 Elo. Piece
artwork: the "cburnett" set by Colin M. L. Burnett (CC BY-SA 3.0), the same
set lichess.org uses by default.

**All-time solvers**

| Solves | Who |
|---|---|
${leaderboard}

</details>
<!-- CHESS:END -->`;

  let readme = fs.existsSync(README_PATH) ? fs.readFileSync(README_PATH, "utf8") : "";
  if (readme.includes("<!-- CHESS:START -->")) {
    readme = readme.replace(/<!-- CHESS:START -->[\s\S]*?<!-- CHESS:END -->/, section);
  } else {
    readme = readme.trimEnd() + "\n\n" + section + "\n";
  }
  fs.writeFileSync(README_PATH, readme);
}

// --- New puzzle --------------------------------------------------------------

function pickNewPuzzle(prevState) {
  const bank = loadJson(BANK_PATH, []);
  if (!bank.length) throw new Error("puzzle bank is empty");

  const pool = bank.length > 1 ? bank.filter((p) => p.id !== prevState.puzzleId) : bank;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  const game = new Chess(picked.fen);
  const options = buildOptions(game, picked.correctUci, picked.correctSan);

  return {
    puzzleId: picked.id,
    fen: picked.fen,
    turn: picked.turn,
    rating: picked.rating,
    themeLabel: pickThemeLabel(picked.themes),
    correctUci: picked.correctUci,
    options,
    solvedBy: [],
    incorrectCount: 0,
    allTimeLeaderboard: prevState.allTimeLeaderboard || {},
  };
}

function startNewPuzzle() {
  const prevState = loadJson(STATE_PATH, {});
  const state = pickNewPuzzle(prevState);
  saveState(state);
  renderOutputs(state);
}

// --- Answer handling ---------------------------------------------------------

function handleAnswer() {
  const match = ISSUE_TITLE.match(/^puzzle:\s*([A-Za-z0-9]+):\s*([A-D])$/i);
  if (!match) {
    finish(
      false,
      `@${ISSUE_USER} I couldn't parse that as a puzzle answer — issue titles must look like \`puzzle: <id>: A\`.`,
    );
    return;
  }

  const [, puzzleId, letterRaw] = match;
  const letter = letterRaw.toUpperCase();
  const state = loadJson(STATE_PATH, null);

  if (!state || !state.puzzleId) {
    finish(false, `@${ISSUE_USER} No active puzzle right now — check back soon!`);
    return;
  }

  if (state.puzzleId.toLowerCase() !== puzzleId.toLowerCase()) {
    finish(
      false,
      `@${ISSUE_USER} That puzzle has already rotated out — head back to the README for today's puzzle.`,
    );
    return;
  }

  const option = state.options.find((o) => o.letter === letter);
  if (!option) {
    finish(false, `@${ISSUE_USER} \`${letter}\` isn't one of today's options — check the README.`);
    return;
  }

  state.solvedBy = state.solvedBy || [];
  const alreadySolved = state.solvedBy.some((u) => u.toLowerCase() === ISSUE_USER.toLowerCase());
  const isCorrect = option.uci === state.correctUci;

  if (isCorrect) {
    if (alreadySolved) {
      finish(true, `@${ISSUE_USER} You already solved this one — nice work! A new puzzle comes around daily.`);
      return;
    }
    state.solvedBy.push(ISSUE_USER);
    state.allTimeLeaderboard = state.allTimeLeaderboard || {};
    state.allTimeLeaderboard[ISSUE_USER] = (state.allTimeLeaderboard[ISSUE_USER] || 0) + 1;
    saveState(state);
    renderOutputs(state);
    finish(true, `@${ISSUE_USER} Correct! **${option.san}** was the best move. Nice find — you're on the leaderboard now.`);
    return;
  }

  state.incorrectCount = (state.incorrectCount || 0) + 1;
  saveState(state);
  finish(false, `@${ISSUE_USER} Not quite — **${option.san}** isn't the best move here. Give it another look and try again!`);
}

// --- Entry point --------------------------------------------------------------

function main() {
  if (MODE === "scheduled") {
    startNewPuzzle();
    setOutput("ok", "true");
    return;
  }

  const isNewPuzzleRequest = /^puzzle:\s*new$/i.test(ISSUE_TITLE);
  if (isNewPuzzleRequest) {
    const repoOwner = REPO.split("/")[0] || "";
    if (repoOwner.toLowerCase() !== ISSUE_USER.toLowerCase()) {
      finish(false, `@${ISSUE_USER} Only @${repoOwner} can force a new puzzle — a fresh one comes automatically every day.`);
      return;
    }
    startNewPuzzle();
    finish(true, `@${ISSUE_USER} New puzzle is up — check the README!`);
    return;
  }

  handleAnswer();
}

main();
