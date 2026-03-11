import { useGameStore } from "@/store/useGameStore";
import { PlayingCard } from "../PlayingCard";
import { useTranslate } from "@/hooks/useTranslate";

export function DiscussionPhase() {
  const { room, socketId, detectiveMathNextPhase } = useGameStore();
  const { t } = useTranslate();

  if (!room?.detectiveMathState) return null;

  const state = room.detectiveMathState;
  const myPlayer = state.players[socketId];
  const isHost = socketId === room.roomHostId;

  const parseCard = (cardStr: string) => {
    const parts = cardStr.split('-');
    return { rank: parts[0], suit: parts[1] };
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center w-full shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-black text-indigo-400 mb-2">{t('gameDetectiveMath.discussionPhase')}</h2>
        <p className="text-slate-400">
          {t('gameDetectiveMath.discussionDesc')}{' '}
          <span className={`font-bold ${myPlayer?.role === 'CONSPIRATOR' ? 'text-rose-400' : 'text-emerald-400'}`}>
            {myPlayer?.role === 'CONSPIRATOR' ? `${state.conspiratorRange?.[0]} ~ ${state.conspiratorRange?.[1]}` : state.targetNumber}
          </span>
        </p>
      </div>

      <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-4 sm:p-6 overflow-x-auto min-h-[300px]">
        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 text-center">{t('gameDetectiveMath.playedCards')}</h3>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {state.playOrder.map(pid => {
            const player = state.players[pid];
            const pName = room.players.find(p => p.socketId === pid)?.name || 'Unknown';
            const isMe = socketId === pid;
            return (
              <div key={pid} className={`flex flex-col items-center p-3 rounded-xl border ${isMe ? 'bg-indigo-950/30 border-indigo-500/50' : 'bg-slate-900/50 border-slate-800'} transition-all min-w-[120px]`}>
                <span className={`text-sm font-bold mb-2 truncate max-w-[100px] ${isMe ? 'text-indigo-400' : 'text-slate-300'}`}>{pName} {isMe && "(You)"}</span>
                <div className="flex gap-2 min-h-[140px]">
                  {player.playedCards.map((cardStr) => {
                    const { rank, suit } = parseCard(cardStr);
                    return (
                      <div key={cardStr} className="w-16 h-24 sm:w-20 sm:h-28 transform hover:scale-105 transition-transform">
                        <PlayingCard rank={rank} suit={suit} className="w-full h-full shadow-md" />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isHost && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => detectiveMathNextPhase()}
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
