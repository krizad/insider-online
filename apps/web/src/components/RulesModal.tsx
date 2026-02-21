import { useState } from 'react';

export function RulesModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-800 hover:bg-slate-800/50"
        title="How to Play"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
        How to Play
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-left">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10">
              <h2 className="text-2xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                How to Play
              </h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-500 hover:text-slate-300 hover:bg-slate-800 p-2 rounded-full transition-colors"
                aria-label="Close rules"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 text-slate-300 bg-slate-900/50">
              <div>
                <h3 className="text-indigo-400 font-black uppercase tracking-wider text-sm mb-3">The Setup</h3>
                <p className="leading-relaxed">WHO-KNOW is a game of deduction and deception. One player is the <strong className="text-amber-500">Game Host</strong>, one is the secret <strong className="text-rose-400">Insider (Know)</strong>, and the rest are <strong className="text-slate-100">Commoners (Unknow)</strong>.</p>
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
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    <span>If the group <strong>fails</strong> to guess the word in 3 minutes → <span className="text-red-400 font-bold">Everyone loses.</span></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>If the group guesses the word, but <strong>fails</strong> to catch the Insider → <span className="text-rose-400 font-bold">The Insider wins!</span></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span>If the group guesses the word AND correctly votes out the Insider → <span className="text-green-400 font-bold">The Commoners win!</span></span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 bg-slate-900 mt-auto">
               <button 
                 onClick={() => setIsOpen(false)} 
                 className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg py-4 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
               >
                 Got it, let's play!
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
