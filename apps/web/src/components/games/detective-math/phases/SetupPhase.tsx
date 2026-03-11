import { useGameStore } from "@/store/useGameStore";
import { useState } from "react";
import { PlayingCard } from "../PlayingCard";
import { useTranslate } from "@/hooks/useTranslate";

export function SetupPhase() {
  const { room, socketId, detectiveMathSubmitNumber } = useGameStore();
  const { t } = useTranslate();
  const [numberInput, setNumberInput] = useState<string>("");

  if (!room?.detectiveMathState) return null;

  const state = room.detectiveMathState;
  const myPlayer = state.players[socketId];
  if (!myPlayer) return null;
  const isInformer = myPlayer.role === 'INFORMER';

  const parseCard = (cardStr: string) => {
    const parts = cardStr.split('-');
    return { rank: parts[0], suit: parts[1] };
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center w-full shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-black text-indigo-400 mb-2">{t('gameDetectiveMath.setupPhase')}</h2>
        <p className="text-slate-400">
          {isInformer
            ? t('gameDetectiveMath.informerSetupDesc')
            : t('gameDetectiveMath.waitingInformerSetup')}
        </p>
      </div>

      {/* Your Hand */}
      {myPlayer.hand.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-2xl">
          <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 text-center">{t('gameDetectiveMath.yourHand')}</h3>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 justify-start sm:justify-center items-center px-4">
            {myPlayer.hand.map((cardStr) => {
              const { rank, suit } = parseCard(cardStr);
              return (
                <div key={cardStr} className="flex-shrink-0 w-24 h-36 sm:w-32 sm:h-[180px] transform hover:scale-105 transition-transform">
                  <PlayingCard rank={rank} suit={suit} className="w-full h-full" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Informer number input */}
      {isInformer ? (
        <div className="w-full max-w-md mx-auto space-y-4 bg-slate-950 p-6 rounded-xl border border-indigo-500/30">
          <p className="text-slate-300 font-medium text-center">
            {t('gameDetectiveMath.enterTargetNumber')}
          </p>
          <input
            type="number"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
            placeholder={t('gameDetectiveMath.targetNumberPlaceholder')}
            className="w-full bg-slate-900 border-2 border-slate-800 focus:border-indigo-500 text-white px-4 py-3 rounded-xl outline-none transition-all font-medium text-center"
            onKeyDown={(e) => e.key === 'Enter' && numberInput && detectiveMathSubmitNumber(Number(numberInput))}
          />
          <button
            onClick={() => detectiveMathSubmitNumber(Number(numberInput))}
            disabled={!numberInput}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black px-4 py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] uppercase tracking-wider"
          >
            {t('gameDetectiveMath.confirmNumber')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          <p className="text-slate-300 font-medium animate-pulse">{t('gameDetectiveMath.waitingInformer')}</p>
        </div>
      )}
    </div>
  );
}
