export function DetectiveMathRules() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-indigo-400 font-black uppercase tracking-wider text-sm mb-3">🔢 Detective Math</h3>
        <p className="leading-relaxed">
          A game of hidden numbers and deductive reasoning! One player (the Informer) sets a Target Number. Everyone plays standard playing cards to relate to that number. However, the Conspirator doesn't know the number and must bluff their way through!
        </p>
      </div>

      <div>
        <h3 className="text-indigo-400 font-black uppercase tracking-wider text-sm mb-3">Roles</h3>
        <ul className="space-y-4">
          <li className="flex gap-3">
            <span className="text-indigo-400 mt-0.5 flex-shrink-0 text-xl leading-none">📝</span>
            <div>
              <strong className="text-slate-100 block mb-1">Informer</strong>
              Sets the Target Number based on their cards. They play the first card in each round and know who the true Detectives are (because everyone except the Conspirator gets the number).
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-rose-400 mt-0.5 flex-shrink-0 text-xl leading-none">🕵️</span>
            <div>
              <strong className="text-slate-100 block mb-1">Conspirator</strong>
              Doesn't know the Target Number! Must carefully observe the Informer's and others' cards to play cards that seem to fit, avoiding detection.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 mt-0.5 flex-shrink-0 text-xl leading-none">🔎</span>
            <div>
              <strong className="text-slate-100 block mb-1">Detective</strong>
              Knows the Target Number. Plays cards that relate to the number to prove they know it, while trying to catch the Conspirator.
            </div>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-indigo-400 font-black uppercase tracking-wider text-sm mb-3">How to Play</h3>
        <ul className="space-y-4">
          <li className="flex gap-3">
            <span className="text-slate-200 mt-0.5 flex-shrink-0 text-xl leading-none">1️⃣</span>
            <div>
              <strong className="text-slate-100 block mb-1">Setup</strong>
              Roles are dealt. The Informer chooses a Target Number. Everyone except the Conspirator receives it.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-slate-200 mt-0.5 flex-shrink-0 text-xl leading-none">2️⃣</span>
            <div>
              <strong className="text-slate-100 block mb-1">Card Playing (2 Rounds)</strong>
              Starting with the Informer, each player plays one card face-up. This repeats for a second round.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-slate-200 mt-0.5 flex-shrink-0 text-xl leading-none">3️⃣</span>
            <div>
              <strong className="text-slate-100 block mb-1">Discussion</strong>
              The Informer explains how their cards relate to the number. Everyone else follows. The Conspirator must bluff!
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-slate-200 mt-0.5 flex-shrink-0 text-xl leading-none">4️⃣</span>
            <div>
              <strong className="text-slate-100 block mb-1">Voting</strong>
              Everyone (except the Informer) votes on who they think the Conspirator is.
            </div>
          </li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-indigo-400 font-black uppercase tracking-wider text-sm mb-3">Scoring</h3>
        <ul className="space-y-4 border-l-2 border-slate-800 pl-4 py-1">
          <li className="text-slate-300"><span className="text-emerald-400 font-bold">✅</span> <strong>Conspirator Caught (0-1 mistakes):</strong> Detectives who voted correctly get 3 points. Informer gets 3 points.</li>
          <li className="text-slate-300"><span className="text-rose-400 font-bold">❌</span> <strong>Conspirator Escapes (2+ mistakes):</strong> Conspirator gets 5 points. Detectives who voted correctly still get 3 points. Informer gets 0 points.</li>
          <li className="text-slate-300"><span className="text-yellow-400 font-bold">🌟</span> <strong>Fooling Detectives:</strong> Informer gets 1 point per incorrect vote cast against them. Conspirator gets 1 point per vote cast against someone else.</li>
        </ul>
      </div>
    </div>
  );
}
