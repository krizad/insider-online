export function GobblerRules() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-blue-400 font-black uppercase tracking-wider text-sm mb-3">Gobbler Tic Tac Toe</h3>
        <p className="leading-relaxed">
          A strategic twist on the classic game! Each player has pieces of different sizes that can "gobble" up smaller pieces.
        </p>
      </div>
      <div>
        <h3 className="text-blue-400 font-black uppercase tracking-wider text-sm mb-3">The Rules</h3>
        <ul className="space-y-4">
          <li className="flex gap-3">
            <span className="text-slate-200 mt-0.5 flex-shrink-0 text-xl leading-none">📏</span>
            <div>
              <strong className="text-slate-100 block mb-1">Piece Sizes</strong>
              You have pieces in 3 sizes: Small, Medium, and Large. Each player gets 2 of each size.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-amber-400 mt-0.5 flex-shrink-0 text-xl leading-none">👄</span>
            <div>
              <strong className="text-slate-100 block mb-1">Gobbling</strong>
              You can place a larger piece <strong>over any smaller piece</strong> already on the board (even your own!). The smaller piece gets hidden and loses its spot unless the bigger piece is moved later.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-indigo-400 mt-0.5 flex-shrink-0 text-xl leading-none">🔄</span>
            <div>
              <strong className="text-slate-100 block mb-1">Moving Pieces</strong>
              Instead of playing a new piece from your inventory, you can move one of your pieces already on the board to a new spot (even to gobble another piece). But be careful not to reveal an opponent's piece that might complete their line!
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-green-400 mt-0.5 flex-shrink-0 text-xl leading-none">🎯</span>
            <div>
              <strong className="text-slate-100 block mb-1">Winning</strong>
              First to line up 3 of their visible pieces in a row horizontally, vertically, or diagonally wins!
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
