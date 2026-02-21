"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role } from '@repo/types';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface RoleCardProps {
  role: Role | null;
  word?: string | null;
}

export const RoleCard = ({ role, word }: RoleCardProps) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative w-full max-w-sm mx-auto overflow-hidden">
      <div className="flex items-center justify-between w-full mb-6">
        <h2 className="text-2xl font-bold text-slate-200 tracking-wider m-0">YOUR ROLE</h2>
        <button
          onClick={() => setIsRevealed(!isRevealed)}
          className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-slate-300 transition-colors flex items-center gap-2"
          title={isRevealed ? "Hide Role" : "Show Role"}
        >
          {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
          <span className="text-xs font-bold uppercase tracking-wider">{isRevealed ? 'Hide' : 'Show'}</span>
        </button>
      </div>
      
      <div 
        className="relative w-full aspect-video cursor-pointer group"
        style={{ perspective: '1000px' }}
        onClick={() => setIsRevealed(!isRevealed)}
      >
        <AnimatePresence mode="wait">
          {!isRevealed ? (
            <motion.div
              key="hidden"
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-800 rounded-xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center transform-gpu group-hover:bg-slate-700 transition-colors"
            >
              <EyeOff className="w-12 h-12 text-slate-500 mb-3 group-hover:text-slate-400 transition-colors" />
              <p className="text-slate-400 font-medium group-hover:text-slate-300 transition-colors">Tap to Reveal</p>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "absolute inset-0 rounded-xl border flex items-center justify-center shadow-inner transform-gpu",
                role === Role.Host && "bg-amber-900/50 border-amber-500 text-amber-500",
                role === Role.Know && "bg-rose-900/50 border-rose-500 text-rose-500",
                role === Role.Unknow && "bg-emerald-900/50 border-emerald-500 text-emerald-500",
                !role && "bg-slate-800 border-slate-600 text-slate-400"
              )}
            >
              <div className="flex flex-col items-center justify-center w-full">
                <h3 className="text-4xl font-black tracking-widest drop-shadow-md">
                  {role || "WAITING"}
                </h3>
                {word && role !== Role.Unknow && (
                  <div className="mt-4 pt-4 border-t border-[currentColor]/30 text-center w-full px-4">
                    <span className="text-xs uppercase tracking-widest opacity-80 block mb-1">Target Word</span>
                    <span className="text-2xl font-black drop-shadow-md">{word}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 text-center text-sm text-slate-500">
        {role === Role.Host ? (
          <p>You are the Host! Guide the Commoners.</p>
        ) : role === Role.Know ? (
          <p>You are the Insider! Guide them secretly.</p>
        ) : role === Role.Unknow ? (
          <p>You are a Commoner! Find the word and the Insider.</p>
        ) : (
          <p>Keep your role a secret!</p>
        )}
      </div>
    </div>
  );
};
