export function RPSRules() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-amber-400 font-black uppercase tracking-wider text-sm mb-3">Hand Duel (Rock Paper Scissors)</h3>
        <p className="leading-relaxed">
          An intense, competitive version of the timeless hand game. Outsmart your opponents to claim victory.
        </p>
      </div>
      <div>
        <h3 className="text-amber-400 font-black uppercase tracking-wider text-sm mb-3">The Basics</h3>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-around text-center mt-2">
           <div>
             <div className="text-4xl mb-2">✊</div>
             <div className="text-sm font-bold text-slate-400">Beats ✌️</div>
           </div>
           <div>
             <div className="text-4xl mb-2">✋</div>
             <div className="text-sm font-bold text-slate-400">Beats ✊</div>
           </div>
           <div>
             <div className="text-4xl mb-2">✌️</div>
             <div className="text-sm font-bold text-slate-400">Beats ✋</div>
           </div>
        </div>
      </div>
       <div>
        <h3 className="text-amber-400 font-black uppercase tracking-wider text-sm mb-3">Game Modes</h3>
        <ul className="space-y-4">
          <li className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
             <span className="text-indigo-400 mt-0.5 flex-shrink-0 text-xl leading-none">🤺</span>
             <div>
               <strong className="text-slate-100 block mb-1">1v1 Round Robin</strong>
               Players face off in a series of 1-on-1 duels until everyone has battled each other. Winning a duel gives you a point.
             </div>
          </li>
          <li className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
             <span className="text-rose-400 mt-0.5 flex-shrink-0 text-xl leading-none">⚔️</span>
             <div>
               <strong className="text-slate-100 block mb-1">All At Once</strong>
               Chaos reigns! All players throw at the same time. The winning sign is the one that beats the most other signs. If there's a tie, nobody scores. First to reach the target score wins!
             </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
