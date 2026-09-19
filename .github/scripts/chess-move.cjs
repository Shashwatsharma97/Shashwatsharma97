// Powers the "Play Chess With Me" section of the profile README.
// Triggered by .github/workflows/chess.yml whenever someone opens an issue
// titled "chess: e2e4" (a move) or "chess: new" (start a fresh game).
//
// Design notes:
// - Legal-move generation/validation is delegated to chess.js (MIT licensed)
//   instead of hand-rolled, since correctly implementing check/checkmate/
//   castling/en-passant/promotion from scratch is a solved problem not worth
//   re-solving here.
// - The board is rendered as one big SVG (chess/board.svg), styled after
//   lichess's default board: the classic brown squares, a yellow-green
//   highlight on the last move's two squares, and the same "cburnett" piece
//   set lichess uses by default. The piece artwork (by Colin M. L. Burnett)
//   is CC BY-SA 3.0 / GFDL; the exact path data below is taken from the
//   MIT-licensed python-chess project (github.com/niklasf/python-chess,
//   chess/svg.py), which bundles it for the same purpose.
// - Move-link markdown is spliced into README.md between
//   <!-- CHESS:START --> / <!-- CHESS:END --> markers so this can live
//   alongside the rest of the profile content instead of replacing it.
// - All state (FEN, last mover/move, recent moves, leaderboard) lives in
//   chess/state.json, committed back to the repo by the workflow.

const fs = require("fs");
const path = require("path");
const { Chess } = require("chess.js");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const STATE_PATH = path.join(REPO_ROOT, "chess", "state.json");
const BOARD_SVG_PATH = path.join(REPO_ROOT, "chess", "board.svg");
const README_PATH = path.join(REPO_ROOT, "README.md");
const PIECES = require("./cburnett-pieces.json");

const REPO = process.env.REPO || "";
const ISSUE_USER = process.env.ISSUE_USER || "someone";
const ISSUE_TITLE = (process.env.ISSUE_TITLE || "").trim();
const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT;

// Board geometry. Piece paths below are drawn for a 45x45 unit square (the
// python-chess/lichess convention), so SQUARE is kept an exact multiple of
// 45 for crisp, integer scaling.
const SQUARE = 90;
const BOARD_PX = SQUARE * 8;
const PIECE_SCALE = SQUARE / 45;

// Lichess's default ("brown") board theme.
const LIGHT_SQUARE = "#f0d9b5";
const DARK_SQUARE = "#b58863";
const LIGHT_SQUARE_LASTMOVE = "#cdd26a";
const DARK_SQUARE_LASTMOVE = "#aaa23a";
const CHECK_GLOW = "#ff0000";

function loadState() {
  if (fs.existsSync(STATE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
    } catch {
      /* fall through to fresh state */
    }
  }
  return { fen: null, lastMover: "", lastMove: null, recentMoves: [], leaderboard: {} };
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

// --- SVG board rendering --------------------------------------------------

function squareOrigin(file, rank) {
  // file: 0=a..7=h, rank: 0=rank1..7=rank8. Rank 8 is drawn at the top.
  const x = file * SQUARE;
  const y = (7 - rank) * SQUARE;
  return { x, y };
}

function isLightSquare(file, rank) {
  return (file + rank) % 2 === 1;
}

function boardSvg(game, state) {
  const board = game.board(); // board[0] = rank 8 ... board[7] = rank 1
  const lastMove = state.lastMove;
  const inCheck = game.inCheck();
  const kingSquare = inCheck ? findKingSquare(game) : null;

  let squares = "";
  let pieces = "";
  let coords = "";

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const { x, y } = squareOrigin(file, rank);
      const light = isLightSquare(file, rank);
      const squareName = "abcdefgh"[file] + (rank + 1);
      const isLastMoveSquare = lastMove && (lastMove.from === squareName || lastMove.to === squareName);

      let fill = light ? LIGHT_SQUARE : DARK_SQUARE;
      if (isLastMoveSquare) fill = light ? LIGHT_SQUARE_LASTMOVE : DARK_SQUARE_LASTMOVE;

      squares += `<rect x="${x}" y="${y}" width="${SQUARE}" height="${SQUARE}" fill="${fill}"/>`;

      if (kingSquare === squareName) {
        squares += `<radialGradient id="checkGlow" r="0.5"><stop offset="0%" stop-color="${CHECK_GLOW}" stop-opacity="1"/><stop offset="100%" stop-color="${CHECK_GLOW}" stop-opacity="0"/></radialGradient><rect x="${x}" y="${y}" width="${SQUARE}" height="${SQUARE}" fill="url(#checkGlow)"/>`;
      }

      // File letters along the bottom rank, rank numbers along the left file
      // — same placement convention lichess uses (small label inside the
      // square's corner, colored to contrast against that square).
      const labelColor = light ? DARK_SQUARE : LIGHT_SQUARE;
      if (rank === 0) {
        coords += `<text x="${x + SQUARE - 6}" y="${y + SQUARE - 6}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${labelColor}" text-anchor="end">${"abcdefgh"[file]}</text>`;
      }
      if (file === 0) {
        coords += `<text x="${x + 6}" y="${y + 18}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${labelColor}">${rank + 1}</text>`;
      }
    }
  }

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const cell = board[r][f]; // board[0] is rank 8
      if (!cell) continue;
      const rank = 7 - r;
      const { x, y } = squareOrigin(f, rank);
      const key = cell.color === "w" ? cell.type.toUpperCase() : cell.type;
      pieces += `<g transform="translate(${x},${y}) scale(${PIECE_SCALE})">${PIECES[key]}</g>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOARD_PX} ${BOARD_PX}" width="${BOARD_PX}" height="${BOARD_PX}">
<rect x="0" y="0" width="${BOARD_PX}" height="${BOARD_PX}" fill="${DARK_SQUARE}"/>
${squares}
${coords}
${pieces}
</svg>`;
}

function findKingSquare(game) {
  const board = game.board();
  const turnColor = game.turn();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const cell = board[r][f];
      if (cell && cell.type === "k" && cell.color === turnColor) {
        return "abcdefgh"[f] + (8 - r);
      }
    }
  }
  return null;
}

// --- Move links + README splice -------------------------------------------

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
  const side = game.turn() === "w" ? "White" : "Black";
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
  if (!game.isGameOver()) {
    return game.inCheck()
      ? `**Check!** Game in progress — anyone can play the next move.`
      : "Game in progress — anyone can play the next move. That's the point!";
  }
  if (game.isCheckmate()) return `Checkmate — ${game.turn() === "w" ? "Black" : "White"} wins!`;
  if (game.isStalemate()) return "Draw by stalemate.";
  if (game.isThreefoldRepetition()) return "Draw by threefold repetition.";
  if (game.isInsufficientMaterial()) return "Draw — insufficient material.";
  if (game.isDraw()) return "Draw.";
  return "Game over.";
}

function renderOutputs(game, state) {
  fs.mkdirSync(path.dirname(BOARD_SVG_PATH), { recursive: true });
  fs.writeFileSync(BOARD_SVG_PATH, boardSvg(game, state));

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

  // Cache-bust the raw.githubusercontent.com URL (it CDN-caches per URL for
  // a few minutes) so the board image updates immediately after each move.
  const cacheBust = Date.now();
  const boardUrl = `https://raw.githubusercontent.com/${REPO}/main/chess/board.svg?v=${cacheBust}`;

  const section = `<!-- CHESS:START -->
### ♞️ Play Chess With Me

${statusLine(game)}

<div align="center">
<img src="${boardUrl}" alt="chess board" width="480" />
</div>
${moveLinksMarkdown(game)}

<details>
<summary><b>How this works · recent moves · leaderboard</b></summary>

Clicking a destination opens a pre-filled GitHub Issue — hit **Submit new issue**
and a GitHub Action validates the move, updates the board above, and closes the
issue automatically. No account setup, no app install, just click and go.

Piece artwork: the "cburnett" set by Colin M. L. Burnett (CC BY-SA 3.0),
the same set lichess.org uses by default.

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
    state = { fen: game.fen(), lastMover: "", lastMove: null, recentMoves: [], leaderboard: state.leaderboard || {} };
    saveState(state);
    renderOutputs(game, state);
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
  state.lastMove = { from: result.from, to: result.to };
  state.recentMoves = [{ san: result.san, by: ISSUE_USER }, ...(state.recentMoves || [])].slice(0, 6);
  state.leaderboard = state.leaderboard || {};
  state.leaderboard[ISSUE_USER] = (state.leaderboard[ISSUE_USER] || 0) + 1;
  saveState(state);
  renderOutputs(game, state);

  let message = `@${ISSUE_USER} Move played: **${result.san}**. Board updated — check the README!`;
  if (game.isGameOver()) {
    message += ` ${statusLine(game)} Open an issue titled \`chess: new\` to start another game.`;
  }
  finish(true, message);
}

if (require.main === module) main();

module.exports = { boardSvg, renderOutputs, loadState };
