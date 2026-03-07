export function WhoKnowRules() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-indigo-400 font-black uppercase tracking-wider text-sm mb-3">The Setup</h3>
        <p className="leading-relaxed">
          "WHO KNOW?" is a game of deduction and deception. One player is the <strong className="text-amber-500">Game Host</strong>, one is the secret <strong className="text-rose-400">Insider (Know)</strong>, and the rest are <strong className="text-slate-100">Commoners (Unknow)</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-indigo-400 font-black uppercase tracking-wider text-sm mb-3">The Phases</h3>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold flex items-center justify-center">1</span>
            <div>
              <strong className="text-slate-100 block mb-1">Word Setting</strong>
              The Game Host picks a secret word. Only the Host and the Insider know what it is.
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold flex items-center justify-center">2</span>
            <div>
              <strong className="text-slate-100 block mb-1">Questioning</strong>
              Everyone has 3 minutes to ask the Host "Yes" or "No" questions to guess the word. The Insider secretly guides the group towards the answer without being completely obvious.
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold flex items-center justify-center">3</span>
            <div>
              <strong className="text-slate-100 block mb-1">Voting</strong>
              If the word is guessed in time, everyone votes on who they think the Insider was.
            </div>
          </li>
        </ol>
      </div>

      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <h3 className="text-indigo-400 font-black uppercase tracking-wider text-sm mb-3">Winning Conditions</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="text-red-500 mt-0.5 flex-shrink-0 text-xl leading-none">❌</span>
            <span>
              If the group <strong>fails</strong> to guess the word in 3 minutes → <span className="text-red-400 font-bold">Everyone loses.</span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-rose-500 mt-0.5 flex-shrink-0 text-xl leading-none">😈</span>
            <span>
              If the group guesses the word, but <strong>fails</strong> to catch the Insider → <span className="text-rose-400 font-bold">The Insider wins!</span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-500 mt-0.5 flex-shrink-0 text-xl leading-none">✅</span>
            <span>
              If the group guesses the word AND correctly votes out the Insider → <span className="text-green-400 font-bold">The Commoners win!</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
