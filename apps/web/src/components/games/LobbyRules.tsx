export function LobbyRules() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-purple-400 font-black uppercase tracking-wider text-sm mb-3">Welcome to Who Know?</h3>
        <p className="leading-relaxed">
          This is a multiplayer party game platform. Create a room or join a friend's room to play various games together!
        </p>
      </div>
      <div>
        <h3 className="text-purple-400 font-black uppercase tracking-wider text-sm mb-3">Available Game Modes</h3>
        <ul className="space-y-4">
          <li className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
             <span className="text-indigo-400 mt-0.5 flex-shrink-0 text-xl leading-none">🕵️</span>
             <div>
               <strong className="text-slate-100 block mb-1">Who Know!</strong>
               A game of deduction and deception. One player is the Insider trying to guide the group to guess a secret word without being too obvious, while the Commoners try to figure out both the word and who the Insider is!
             </div>
          </li>
          <li className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
             <span className="text-blue-400 mt-0.5 flex-shrink-0 text-xl leading-none">❌⭕️</span>
             <div>
               <strong className="text-slate-100 block mb-1">Gobbler Tic Tac Toe</strong>
               A strategic twist on the classic game! Each player has pieces of different sizes that can "gobble" up smaller pieces. You can even move your pieces around the board!
             </div>
          </li>
          <li className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
             <span className="text-zinc-400 mt-0.5 flex-shrink-0 text-xl leading-none">❌⭕️</span>
             <div>
               <strong className="text-slate-100 block mb-1">Classic Tic Tac Toe</strong>
               The timeless classic. Line up 3 of your marks in a row to win.
             </div>
          </li>
          <li className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
             <span className="text-amber-400 mt-0.5 flex-shrink-0 text-xl leading-none">✌️✊✋</span>
             <div>
               <strong className="text-slate-100 block mb-1">Hand Duel (Rock Paper Scissors)</strong>
               An intense, competitive version of Rock Paper Scissors. Play in 1v1 Round Robin or Chaotic All-at-Once modes!
             </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
