import { useGameStore } from "@/store/useGameStore";
import { DetectiveClubPhase } from "@repo/types";
import { useTranslate } from "@/hooks/useTranslate";

export function PlayingPhase() {
  const { room, socketId, detectiveClubPlayCard } = useGameStore();
  const { t } = useTranslate();

  if (!room || !room.detectiveClubState) return null;

  const state = room.detectiveClubState;
  const myPlayer = state.players[socketId];
  const isMyTurn = state.activePlayerId === socketId;
  const isConspirator = myPlayer?.role === 'CONSPIRATOR';

  // Find the active player's name
  const activePlayerName = room.players.find(p => p.socketId === state.activePlayerId)?.name || 'Someone';

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center w-full shadow-lg">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">The Secret Word</span>
        {isConspirator ? (
          <div className="flex items-center justify-center">
            <span className="text-xl font-bold bg-slate-950 text-slate-500 px-6 py-2 rounded-lg border border-slate-800 tracking-[0.5em] blur-[2px] select-none pointer-events-none">????????</span>
          </div>
        ) : (
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 bg-emerald-500/10 inline-block px-6 py-2 rounded-lg border border-emerald-500/20 shadow-inner">
            {state.word}
          </p>
        )}
        <p className="text-sm text-slate-400 mt-4">
          {state.currentPhase === DetectiveClubPhase.PLAYING_ROUND_1 ? "Round 1 of 2" : "Round 2 of 2"}
        </p>
      </div>

      {/* Table / Played Cards Area */}
      <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-4 sm:p-6 overflow-x-auto min-h-[300px]">
        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 text-center">Played Cards</h3>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {state.playOrder.map(pid => {
            const player = state.players[pid];
            const pName = room.players.find(p => p.socketId === pid)?.name || 'Unknown';
            const isActive = state.activePlayerId === pid;
            return (
              <div key={pid} className={`flex flex-col items-center p-3 rounded-xl border ${isActive ? 'bg-indigo-950/30 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900/50 border-slate-800'} transition-all min-w-[120px]`}>
                <span className={`text-sm font-bold mb-2 truncate max-w-[100px] ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>{pName}</span>
                <div className="flex gap-2 min-h-[140px]">
                  {player.playedCards.map((cardUrl, idx) => (
                    <div key={idx} className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden border-2 border-slate-700 shadow-md transform hover:scale-105 transition-transform cursor-pointer">
                      <img src={cardUrl} alt="Played Card" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {/* Empty slots for missing plays */}
                  {Array.from({ length: (state.currentPhase === DetectiveClubPhase.PLAYING_ROUND_1 ? 1 : 2) - player.playedCards.length }).map((_, i) => (
                    <div key={`empty-${i}`} className={`w-20 h-28 sm:w-24 sm:h-32 rounded-lg border-2 border-dashed flex items-center justify-center ${isActive ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-slate-800/80 bg-slate-900/20'}`}>
                      {isActive && <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin opacity-50"></div>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Your Hand */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Status indicator banner */}
        <div className={`absolute top-0 left-0 w-full py-1 text-center text-xs font-bold uppercase tracking-widest ${isMyTurn ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
          {isMyTurn ? "Your Turn - Play a Card" : `Waiting for ${activePlayerName}...`}
        </div>

        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 text-center mt-6">Your Hand</h3>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 justify-start sm:justify-center items-center px-4">
          {myPlayer?.hand.map((cardUrl, idx) => (
            <button
              key={idx}
              onClick={() => isMyTurn && detectiveClubPlayCard(idx)}
              disabled={!isMyTurn}
              className={`relative group flex-shrink-0 w-24 h-36 sm:w-32 sm:h-48 rounded-xl overflow-hidden border-2 transition-all ${
                isMyTurn 
                  ? 'border-indigo-500/50 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-2 cursor-pointer' 
                  : 'border-slate-700 opacity-60 cursor-not-allowed grayscale-[30%]'
              }`}
            >
              <img src={cardUrl} alt="Hand Card" className="w-full h-full object-cover" />
              {isMyTurn && (
                <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/40 transition-colors flex items-center justify-center backdrop-blur-[0px] group-hover:backdrop-blur-[2px]">
                   <span className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg transform scale-90 group-hover:scale-100 transition-all">Play Card</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
