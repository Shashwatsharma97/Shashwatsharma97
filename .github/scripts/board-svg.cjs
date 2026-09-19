// Renders a chess position as a big, lichess-styled SVG board.
//
// Piece artwork: the "cburnett" set by Colin M. L. Burnett (CC BY-SA 3.0),
// the same set lichess.org uses by default. The path data in
// cburnett-pieces.json is taken from the MIT-licensed python-chess project
// (github.com/niklasf/python-chess, chess/svg.py), which bundles it for the
// same purpose. Piece paths are drawn for a 45x45 unit square (the
// python-chess/lichess convention), so SQUARE is kept an exact multiple of
// 45 for crisp, integer scaling.

const path = require("path");
const PIECES = require(path.join(__dirname, "cburnett-pieces.json"));

const SQUARE = 90;
const BOARD_PX = SQUARE * 8;
const PIECE_SCALE = SQUARE / 45;

// Lichess's default ("brown") board theme.
const LIGHT_SQUARE = "#f0d9b5";
const DARK_SQUARE = "#b58863";
const LIGHT_SQUARE_HIGHLIGHT = "#cdd26a";
const DARK_SQUARE_HIGHLIGHT = "#aaa23a";

function squareOrigin(file, rank) {
  // file: 0=a..7=h, rank: 0=rank1..7=rank8. Rank 8 is drawn at the top.
  return { x: file * SQUARE, y: (7 - rank) * SQUARE };
}

function isLightSquare(file, rank) {
  return (file + rank) % 2 === 1;
}

/**
 * @param {import("chess.js").Chess} game
 * @param {{ highlightSquares?: string[] }} [opts]
 */
function renderBoardSvg(game, opts = {}) {
  const highlight = new Set(opts.highlightSquares || []);
  const board = game.board(); // board[0] = rank 8 ... board[7] = rank 1

  let squares = "";
  let pieces = "";
  let coords = "";

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const { x, y } = squareOrigin(file, rank);
      const light = isLightSquare(file, rank);
      const squareName = "abcdefgh"[file] + (rank + 1);
      const isHighlighted = highlight.has(squareName);

      const fill = isHighlighted
        ? light
          ? LIGHT_SQUARE_HIGHLIGHT
          : DARK_SQUARE_HIGHLIGHT
        : light
          ? LIGHT_SQUARE
          : DARK_SQUARE;

      squares += `<rect x="${x}" y="${y}" width="${SQUARE}" height="${SQUARE}" fill="${fill}"/>`;

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

module.exports = { renderBoardSvg };
