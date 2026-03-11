import { useGameStore } from "@/store/useGameStore";
import { useState } from "react";
import { PlayingCard } from "../PlayingCard";
import { useTranslate } from "@/hooks/useTranslate";

export function VotingPhase() {
  const { room, socketId, detectiveMathVote } = useGameStore();
  const { t } = useTranslate();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  if (!room?.detectiveMathState) return null;

  const state = room.detectiveMathState;
  const myPlayer = state.players[socketId];
  const hasVoted = myPlayer?.votedFor != null;

  const parseCard = (cardStr: string) => {
    const parts = cardStr.split('-');
    return { rank: parts[0], suit: parts[1] };
  };

  if (myPlayer?.role === 'INFORMER') {
    return (
      <div className="flex-1 flex flex-col space-y-6 items-center justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center max-w-lg shadow-2xl">
           <h2 className="text-3xl font-black text-indigo-400 mb-4 uppercase tracking-widest">{t('gameDetectiveMath.votingPhase')}</h2>
           <p className="text-slate-300 text-lg mb-6">{t('gameDetectiveMath.whoIsConspirator')}</p>
           <div className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto"></div>
           <p className="text-slate-500 mt-6 font-medium">{t('gameDetectiveMath.conspiratorWait')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center w-full shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-black text-rose-400 mb-2">{t('gameDetectiveMath.whoIsConspirator')}</h2>
        <p className="text-slate-400 mt-2">
          {t('gameDetectiveMath.targetNumberIs')} <span className={`font-bold ${myPlayer?.role === 'CONSPIRATOR' ? 'text-rose-400' : 'text-emerald-400'}`}>
            {myPlayer?.role === 'CONSPIRATOR' ? `${state.conspiratorRange?.[0]} ~ ${state.conspiratorRange?.[1]}` : state.targetNumber}
          </span>
        </p>
      </div>

      {hasVoted ? (
        <div className="flex-1 flex flex-col items-center justify-center">
           <div className="bg-emerald-950/30 p-6 rounded-xl border border-emerald-900/50 text-center">
              <p className="text-emerald-400 font-bold text-xl mb-2">Vote Locked In</p>
              <p className="text-slate-400">Waiting for other players...</p>
           </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-4 max-w-2xl mx-auto w-full">
          {state.playOrder.map(pid => {
            const player = state.players[pid];
            const pName = room.players.find(p => p.socketId === pid)?.name || 'Unknown';
            const isMe = socketId === pid;
            const isInformer = player.role === 'INFORMER';
            
            if (isMe || isInformer) return null;

            return (
              <button 
                key={pid}
                onClick={() => setSelectedPlayer(pid)}
                className={`flex items-center p-4 rounded-xl border-2 transition-all text-left ${
                  selectedPlayer === pid 
                    ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <div className="flex-1">
                   <span className={`text-lg font-bold ${selectedPlayer === pid ? 'text-rose-400' : 'text-slate-200'}`}>{pName}</span>
                </div>
                <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {player.playedCards.map((cardStr) => {
                    const { rank, suit } = parseCard(cardStr);
                    return (
                      <div key={cardStr} className="w-10 h-14 sm:w-16 sm:h-24 transform hover:scale-110 transition-transform origin-bottom z-10">
                        <PlayingCard rank={rank} suit={suit} className="w-full h-full text-[8px] sm:text-xs shadow-md" />
                      </div>
                    );
                  })}
                </div>
              </button>
            )
          })}

          <div className="pt-6 mt-auto">
            <button 
              onClick={() => selectedPlayer && detectiveMathVote(selectedPlayer)}
              disabled={!selectedPlayer}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black px-6 py-4 rounded-xl transition-all shadow-lg shadow-rose-900/20 active:scale-[0.98] uppercase tracking-wider text-xl"
            >
              {t('gameDetectiveMath.lockVote')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
