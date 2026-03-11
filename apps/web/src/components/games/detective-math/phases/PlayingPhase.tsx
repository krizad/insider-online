import { useGameStore } from "@/store/useGameStore";
import { DetectiveMathPhase } from "@repo/types";
import { useState } from "react";
import { PlayingCard } from "../PlayingCard";
import { useTranslate } from "@/hooks/useTranslate";

export function PlayingPhase() {
  const { room, socketId, detectiveMathPlayCard } = useGameStore();
  const { t } = useTranslate();
  const [confirmPlayIndex, setConfirmPlayIndex] = useState<number | null>(null);

  if (!room?.detectiveMathState) return null;

  const state = room.detectiveMathState;
  const myPlayer = state.players[socketId];
  const isMyTurn = state.activePlayerId === socketId;
  const isConspirator = myPlayer?.role === 'CONSPIRATOR';

  const activePlayerName = room.players.find(p => p.socketId === state.activePlayerId)?.name || 'Someone';

  const parseCard = (cardStr: string) => {
    const parts = cardStr.split('-');
    return { rank: parts[0], suit: parts[1] };
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center w-full shadow-lg">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">{t('gameDetectiveMath.targetNumberIs')}</span>
        {isConspirator ? (
          <div className="flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black bg-slate-950 text-rose-400 px-6 py-2 rounded-lg border border-rose-900/50 tracking-widest shadow-inner">
              {state.conspiratorRange?.[0]} ~ {state.conspiratorRange?.[1]}
            </span>
            <span className="text-xs text-rose-500/70 mt-2 uppercase tracking-wider font-bold">Target is in this range</span>
          </div>
        ) : (
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 bg-emerald-500/10 inline-block px-6 py-2 rounded-lg border border-emerald-500/20 shadow-inner">
            {state.targetNumber}
          </p>
        )}
        <p className="text-sm text-slate-400 mt-4">
          {state.currentPhase === DetectiveMathPhase.PLAYING_ROUND_1 ? `${t('gameDetectiveMath.round')} 1 of 2` : `${t('gameDetectiveMath.round')} 2 of 2`}
        </p>
      </div>

      {/* Table / Played Cards Area */}
      <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-4 sm:p-6 overflow-x-auto min-h-[300px]">
        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 text-center">{t('gameDetectiveMath.playedCards')}</h3>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {state.playOrder.map(pid => {
            const player = state.players[pid];
            const pName = room.players.find(p => p.socketId === pid)?.name || 'Unknown';
            const isActive = state.activePlayerId === pid;
            return (
              <div key={pid} className={`flex flex-col items-center p-3 rounded-xl border ${isActive ? 'bg-indigo-950/30 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900/50 border-slate-800'} transition-all min-w-[120px]`}>
                <span className={`text-sm font-bold mb-2 truncate max-w-[100px] ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>{pName}</span>
                <div className="flex gap-2 min-h-[140px]">
                  {player.playedCards.map((cardStr) => {
                    const { rank, suit } = parseCard(cardStr);
                    return (
                      <div key={cardStr} className="w-16 h-24 sm:w-20 sm:h-28 transform hover:scale-105 transition-transform">
                        <PlayingCard rank={rank} suit={suit} className="w-full h-full" />
                      </div>
                    );
                  })}
                  {Array.from({ length: (state.currentPhase === DetectiveMathPhase.PLAYING_ROUND_1 ? 1 : 2) - player.playedCards.length }).map((_, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={`empty-${i}`} className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-dashed flex items-center justify-center ${isActive ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-slate-800/80 bg-slate-900/20'}`}>
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
        <div className={`absolute top-0 left-0 w-full py-1 text-center text-xs font-bold uppercase tracking-widest ${isMyTurn ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
          {isMyTurn ? t('gameDetectiveMath.playCardPrompt') : `${t('gameDetectiveMath.waitingFor')} ${activePlayerName}...`}
        </div>

        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 text-center mt-6">{t('gameDetectiveMath.yourHand')}</h3>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 justify-start sm:justify-center items-center px-4">
          {myPlayer?.hand.map((cardStr, idx) => {
            const { rank, suit } = parseCard(cardStr);
            return (
              <div
                key={cardStr}
                className={`relative group flex-shrink-0 w-20 h-28 sm:w-24 sm:h-36 transition-all rounded-xl ${
                  isMyTurn 
                    ? 'hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-2' 
                    : 'opacity-80'
                }`}
              >
                 <PlayingCard rank={rank} suit={suit} className="w-full h-full border-[3px] border-slate-700/50" />
                 
                 {isMyTurn && (
                   <button 
                     type="button"
                     className="absolute inset-0 w-full bg-transparent group-hover:bg-indigo-900/40 transition-colors flex items-center justify-center backdrop-blur-[0px] group-hover:backdrop-blur-[2px] cursor-pointer rounded-xl outline-none border-none"
                     onClick={() => setConfirmPlayIndex(idx)}
                     aria-label={`Play ${rank} of ${suit}`}
                   >
                      <span className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg transform scale-90 group-hover:scale-100 transition-all">Play</span>
                   </button>
                 )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {confirmPlayIndex !== null && myPlayer && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" 
          onClick={() => setConfirmPlayIndex(null)}
        >
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div 
            className="bg-slate-900 border-2 border-slate-700 rounded-xl max-w-sm w-full p-6 text-center shadow-2xl transform scale-100 transition-transform" 
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-black text-white mb-4">Confirm Card Play</h2>
            <div className="flex justify-center mb-6">
              <div className="w-24 h-36 rounded-xl overflow-hidden border-4 border-indigo-500 shadow-lg mb-6">
                <PlayingCard 
                  rank={parseCard(myPlayer.hand[confirmPlayIndex]).rank} 
                  suit={parseCard(myPlayer.hand[confirmPlayIndex]).suit} 
                  className="w-full h-full"
                />
              </div>
            </div>
            <p className="text-slate-400 mb-6 font-medium">Are you sure you want to play this card?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmPlayIndex(null)}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  detectiveMathPlayCard(confirmPlayIndex);
                  setConfirmPlayIndex(null);
                }}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg transition-colors shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400"
              >
                Play Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
