export function TicTacToeRules() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-zinc-400 font-black uppercase tracking-wider text-sm mb-3">Classic Tic Tac Toe</h3>
        <p className="leading-relaxed">
          The classic game of X's and O's. Two players take turns placing their mark on a 3x3 grid.
        </p>
      </div>
      <div>
        <h3 className="text-zinc-400 font-black uppercase tracking-wider text-sm mb-3">How to Win</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-amber-500 flex-shrink-0 text-xl leading-none">🏆</span>
            <span>
              The first player to get <strong>3 of their marks in a row</strong> (horizontally, vertically, or diagonally) wins the game.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-slate-400 flex-shrink-0 text-xl leading-none">🤝</span>
            <span>
              If all 9 squares are filled and neither player has 3 in a row, the game is a <strong>Draw</strong>.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
