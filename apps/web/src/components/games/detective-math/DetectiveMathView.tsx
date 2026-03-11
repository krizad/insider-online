"use client";

import { useGameStore } from "@/store/useGameStore";
import { GameType, DetectiveMathPhase } from "@repo/types";
import { SetupPhase } from "./phases/SetupPhase";
import { PlayingPhase } from "./phases/PlayingPhase";
import { DiscussionPhase } from "./phases/DiscussionPhase";
import { VotingPhase } from "./phases/VotingPhase";
import { ScoringPhase } from "./phases/ScoringPhase";
import { useTranslate } from "@/hooks/useTranslate";

export function DetectiveMathView() {
  const { room, socketId } = useGameStore();
  const { t } = useTranslate();

  if (room?.gameType !== GameType.DETECTIVE_MATH) return null;

  if (!room?.detectiveMathState) {
    return <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">{t('gameDetectiveMath.loading')}</div>;
  }

  const state = room.detectiveMathState;
  const myPlayer = state.players[socketId];

  const roleColors: Record<string, string> = {
    INFORMER: "text-indigo-400",
    CONSPIRATOR: "text-rose-400",
    DETECTIVE: "text-emerald-400"
  };
  
  const roleTranslator: Record<string, string> = {
    INFORMER: t('gameDetectiveMath.roleInformer'),
    CONSPIRATOR: t('gameDetectiveMath.roleConspirator'),
    DETECTIVE: t('gameDetectiveMath.roleDetective')
  };

  const roleColor = myPlayer?.role ? (roleColors[myPlayer.role] || "text-slate-400") : "text-slate-400";
  const roleText = myPlayer?.role ? (roleTranslator[myPlayer.role] || "UNKNOWN") : "UNKNOWN";

  return (
    <div className="flex-1 flex flex-col w-full h-full p-4 overflow-y-auto max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center shadow-lg w-full gap-4">
        <div className="text-center sm:text-left">
          <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-1">{t('gameDetectiveMath.yourRole')}</p>
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className={`text-xl font-black ${roleColor}`}>{roleText}</span>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-1">{t('gameDetectiveMath.yourScore')}</p>
          <span className="text-2xl font-black text-amber-400">
            {myPlayer?.score || 0} <span className="text-sm text-slate-500">{t('gameDetectiveMath.pts')}</span>
          </span>
        </div>
      </div>

      {/* Main Game Area */}
      {state.currentPhase === DetectiveMathPhase.SETUP && <SetupPhase />}
      {(state.currentPhase === DetectiveMathPhase.PLAYING_ROUND_1 || state.currentPhase === DetectiveMathPhase.PLAYING_ROUND_2) && <PlayingPhase />}
      {state.currentPhase === DetectiveMathPhase.DISCUSSION && <DiscussionPhase />}
      {state.currentPhase === DetectiveMathPhase.VOTING && <VotingPhase />}
      {state.currentPhase === DetectiveMathPhase.SCORING && <ScoringPhase />}
    </div>
  );
}
