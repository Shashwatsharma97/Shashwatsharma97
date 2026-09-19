// Powers the "Play Chess With Me" section of the profile README.
// Triggered by .github/workflows/chess.yml whenever someone opens an issue
// titled "chess: e2e4" (a move) or "chess: new" (start a fresh game).
//
// Design notes:
// - Legal-move generation/validation is delegated to chess.js (MIT licensed)
//   instead of hand-rolled, since correctly implementing check/checkmate/
//   castling/en-passant/promotion from scratch is a solved problem not worth
//   re-solving here.
// - Board + move-link markdown is spliced into README.md between
//   <!-- CHESS:START --> / <!-- CHESS:END --> markers so this can live
//   alongside the rest of the profile content instead of replacing it.
// - All state (FEN, last mover, recent moves, leaderboard) lives in
//   chess/state.json, committed back to the repo by the workflow.

const fs = require("fs");
const path = require("path");
const { Chess } = require("chess.js");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const STATE_PATH = path.join(REPO_ROOT, "chess", "state.json");
const README_PATH = path.join(REPO_ROOT, "README.md");

const REPO = process.env.REPO || "";
const ISSUE_USER = process.env.ISSUE_USER || "someone";
const ISSUE_TITLE = (process.env.ISSUE_TITLE || "").trim();
const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT;

const WHITE_GLYPHS = { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" };
const BLACK_GLYPHS = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };

function loadState() {
  if (fs.existsSync(STATE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
    } catch {
      /* fall through to fresh state */
    }
  }
  return { fen: null, lastMover: "", recentMoves: [], leaderboard: {} };
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

function pieceGlyph(piece) {
  return piece.color === "w" ? WHITE_GLYPHS[piece.type] : BLACK_GLYPHS[piece.type];
}

function boardMarkdown(game) {
  const board = game.board();
  const files = ["A", "B", "C", "D", "E", "F", "G", "H"];
  let md = "|   | " + files.join(" | ") + " |\n";
  md += "|---|" + files.map(() => ":-:").join("|") + "|\n";
  for (let r = 0; r < 8; r++) {
    const rank = 8 - r;
    const cells = board[r].map((cell) => (cell ? pieceGlyph(cell) : "·"));
    md += `| **${rank}** | ` + cells.join(" | ") + " |\n";
  }
  return md;
}

function issueLink(title) {
  const t = encodeURIComponent(title);
  const body = encodeURIComponent("Just click \"Submit new issue\" — nothing else needed.");
  return `https://github.com/${REPO}/issues/new?title=${t}&body=${body}`;
}

function moveLinksMarkdown(game) {
  if (game.isGameOver()) {
    return `\n**Game over!** [Start a new game](${issueLink("chess: new")}) to play again.\n`;
  }
  const moves = game.moves({ verbose: true });
  const byFrom = {};
  for (const m of moves) {
    const to = m.to + (m.promotion || "");
    (byFrom[m.from] ||= []).push(to);
  }
  const froms = Object.keys(byFrom).sort();
  const side = game.turn() === "w" ? "White (outline pieces)" : "Black (solid pieces)";
  let md = `\n**${side} to move.** Click a destination square to play it:\n\n`;
  md += "| From | To — click one |\n|---|---|\n";
  for (const from of froms) {
    const links = byFrom[from]
      .map((to) => `[${to.toUpperCase()}](${issueLink(`chess: ${from}${to}`)})`)
      .join(" , ");
    md += `| **${from.toUpperCase()}** | ${links} |\n`;
  }
  return md;
}

function statusLine(game) {
  if (!game.isGameOver()) return "Game in progress — anyone can play the next move. That's the point!";
  if (game.isCheckmate()) return `Checkmate — ${game.turn() === "w" ? "Black" : "White"} wins!`;
  if (game.isStalemate()) return "Draw by stalemate.";
  if (game.isThreefoldRepetition()) return "Draw by threefold repetition.";
  if (game.isInsufficientMaterial()) return "Draw — insufficient material.";
  if (game.isDraw()) return "Draw.";
  return "Game over.";
}

function renderReadme(game, state) {
  const recent =
    (state.recentMoves || [])
      .map((m) => `| ${m.san} | [@${m.by}](https://github.com/${m.by}) |`)
      .join("\n") || "| — | no moves yet, be the first! |";

  const leaderboard =
    Object.entries(state.leaderboard || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([user, count]) => `| ${count} | [@${user}](https://github.com/${user}) |`)
      .join("\n") || "| — | no moves yet |";

  const section = `<!-- CHESS:START -->
### ♞️ Play Chess With Me

${statusLine(game)}

${boardMarkdown(game)}
${moveLinksMarkdown(game)}

<details>
<summary><b>How this works · recent moves · leaderboard</b></summary>

Clicking a destination opens a pre-filled GitHub Issue — hit **Submit new issue**
and a GitHub Action validates the move, updates the board above, and closes the
issue automatically. No account setup, no app install, just click and go.

**Recent moves**

| Move | By |
|---|---|
${recent}

**Top movers (all-time)**

| Moves | Who |
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

function main() {
  let state = loadState();
  const isNewGameRequest = /^chess:\s*new$/i.test(ISSUE_TITLE);
  const moveMatch = ISSUE_TITLE.match(/^chess:\s*([a-h][1-8])([a-h][1-8])([qrbn])?$/i);

  if (!isNewGameRequest && !moveMatch) {
    finish(false, `@${ISSUE_USER} I couldn't parse that as a move — issue titles must look like \`chess: e2e4\`.`);
    return;
  }

  let game = new Chess();
  if (state.fen && !isNewGameRequest) {
    try {
      game.load(state.fen);
    } catch {
      game = new Chess();
    }
  }

  if (isNewGameRequest) {
    if (state.fen && !game.isGameOver()) {
      finish(false, `@${ISSUE_USER} The current game isn't finished yet — someone needs to checkmate/draw it first!`);
      return;
    }
    game = new Chess();
    state = { fen: game.fen(), lastMover: "", recentMoves: [], leaderboard: state.leaderboard || {} };
    saveState(state);
    renderReadme(game, state);
    finish(true, `@${ISSUE_USER} New game started! Head back to the README to make the first move.`);
    return;
  }

  if (state.lastMover && state.lastMover.toLowerCase() === ISSUE_USER.toLowerCase()) {
    finish(false, `@${ISSUE_USER} Slow down — you just moved. Give someone else a turn!`);
    return;
  }

  const [, from, to, promotion] = moveMatch;
  let result;
  try {
    result = game.move({ from: from.toLowerCase(), to: to.toLowerCase(), promotion });
  } catch {
    result = null;
  }

  if (!result) {
    finish(
      false,
      `@${ISSUE_USER} \`${from}${to}\` isn't legal right now — someone probably moved first. Check the README for the current board.`,
    );
    return;
  }

  state.fen = game.fen();
  state.lastMover = ISSUE_USER;
  state.recentMoves = [{ san: result.san, by: ISSUE_USER }, ...(state.recentMoves || [])].slice(0, 6);
  state.leaderboard = state.leaderboard || {};
  state.leaderboard[ISSUE_USER] = (state.leaderboard[ISSUE_USER] || 0) + 1;
  saveState(state);
  renderReadme(game, state);

  let message = `@${ISSUE_USER} Move played: **${result.san}**. Board updated — check the README!`;
  if (game.isGameOver()) {
    message += ` ${statusLine(game)} Open an issue titled \`chess: new\` to start another game.`;
  }
  finish(true, message);
}

main();
