import { useGameStore } from "@/store/useGameStore";
import { useTranslate } from "@/hooks/useTranslate";

export function DiscussionPhase() {
  const { room, socketId, detectiveClubNextPhase } = useGameStore();
  const { t } = useTranslate();

  if (!room || !room.detectiveClubState) return null;

  const state = room.detectiveClubState;
  const isHost = socketId === room.roomHostId;

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center w-full shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-black text-indigo-400 mb-2">Discussion Phase</h2>
        <p className="text-slate-400">
          The Informer must now explain why their cards match the word: <span className="text-emerald-400 font-bold">{state.word}</span>
        </p>
        <p className="text-slate-400 mt-2">
          Then, everyone else takes turns explaining their cards. The Conspirator must bluff!
        </p>
      </div>

      {/* Table / Played Cards Area (View Only) */}
      <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-4 sm:p-6 overflow-x-auto min-h-[300px]">
        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 text-center">Played Cards</h3>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {state.playOrder.map(pid => {
            const player = state.players[pid];
            const pName = room.players.find(p => p.socketId === pid)?.name || 'Unknown';
            const isMe = socketId === pid;
            return (
              <div key={pid} className={`flex flex-col items-center p-3 rounded-xl border ${isMe ? 'bg-indigo-950/30 border-indigo-500/50' : 'bg-slate-900/50 border-slate-800'} transition-all min-w-[120px]`}>
                <span className={`text-sm font-bold mb-2 truncate max-w-[100px] ${isMe ? 'text-indigo-400' : 'text-slate-300'}`}>{pName} {isMe && "(You)"}</span>
                <div className="flex gap-2 min-h-[140px]">
                  {player.playedCards.map((cardUrl, idx) => (
                    <div key={idx} className="relative w-24 h-32 sm:w-28 sm:h-40 rounded-lg overflow-hidden border-2 border-slate-700 shadow-md">
                      <img src={cardUrl} alt="Played Card" className="w-full h-full object-cover border-4 border-white rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isHost && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => detectiveClubNextPhase()}
            className="w-full max-w-md bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] uppercase tracking-wider text-lg"
          >
            Start Voting
          </button>
        </div>
      )}
      {!isHost && (
        <div className="text-center mt-6 text-slate-500 font-medium">
          Waiting for the host to start the voting phase...
        </div>
      )}
    </div>
  );
}
