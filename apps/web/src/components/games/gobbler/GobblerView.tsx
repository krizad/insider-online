"use client";

import { useGameStore } from "@/store/useGameStore";
import { RoomStatus, GobblerSize, GobblerPiece, PlayerSide } from "@repo/types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAvatarEmoji } from "@/components/core/utils";
import clsx from "clsx";

const SIZE_STYLES: Record<GobblerSize, { board: string, inventory: string }> = {
  SMALL: { board: "w-10 h-10 border-4 shadow-sm", inventory: "w-6 h-6 border-2 shadow-sm" },
  MEDIUM: { board: "w-20 h-20 border-[6px] shadow-md", inventory: "w-10 h-10 border-[3px] shadow-sm" },
  LARGE: { board: "w-28 h-28 border-[8px] shadow-lg", inventory: "w-14 h-14 border-[4px] shadow-md" },
};

const COLOR_STYLES: Record<PlayerSide, string> = {
  X: "border-indigo-500 bg-indigo-500/20 text-indigo-400 font-bold",
  O: "border-rose-500 bg-rose-500/20 text-rose-400 font-bold",
};

export function GobblerView() {
  const { room, socketId, gobblerJoinSide, gobblerPlacePiece, gobblerMovePiece, gobblerReset } = useGameStore();
  const gb = room?.gobblerState;

  // Local state for selecting a piece to place or move
  const [selectedInventoryPieceId, setSelectedInventoryPieceId] = useState<string | null>(null);
  const [selectedBoardIndex, setSelectedBoardIndex] = useState<number | null>(null);

  if (!gb) return null;

  const mySide = gb.playerXId === socketId ? "X" : gb.playerOId === socketId ? "O" : null;
  const isMyTurn = mySide === gb.currentTurn && room.status === RoomStatus.PLAYING;

  const handleCellClick = (index: number) => {
    if (!isMyTurn) return;

    if (selectedInventoryPieceId) {
      // Place piece from inventory
      gobblerPlacePiece(selectedInventoryPieceId, index);
      setSelectedInventoryPieceId(null);
    } else if (selectedBoardIndex !== null) {
      // Move piece from another cell
      if (selectedBoardIndex === index) {
        // Deselect if clicking the same cell
        setSelectedBoardIndex(null);
      } else {
        gobblerMovePiece(selectedBoardIndex, index);
        setSelectedBoardIndex(null);
      }
    } else {
      // Select piece to move
      const cell = gb.board[index];
      if (cell.length > 0) {
        const topPiece = cell[cell.length - 1];
        if (topPiece.side === mySide) {
           setSelectedBoardIndex(index);
        }
      }
    }
  };

  const handleInventoryClick = (pieceId: string) => {
    if (!isMyTurn) return;
    setSelectedBoardIndex(null); // Clear board selection
    if (selectedInventoryPieceId === pieceId) {
      setSelectedInventoryPieceId(null);
    } else {
      setSelectedInventoryPieceId(pieceId);
    }
  };

  const renderPiece = (piece: GobblerPiece, isSelected: boolean = false, context: 'inventory' | 'board' = 'board') => {
    return (
      <motion.div
        key={context + '-' + piece.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={clsx(
          "rounded-full flex items-center justify-center transition-all flex-shrink-0 relative",
          SIZE_STYLES[piece.size][context],
          COLOR_STYLES[piece.side],
          isSelected && "ring-4 ring-yellow-400 ring-offset-4 ring-offset-slate-900 shadow-[0_0_20px_rgba(250,204,21,0.5)] z-10"
        )}
      >
        <div className={clsx(
          "font-black leading-none select-none",
          context === 'inventory' 
            ? (piece.size === "SMALL" ? "text-[10px]" : piece.size === "MEDIUM" ? "text-sm" : "text-xl")
            : (piece.size === "SMALL" ? "text-lg" : piece.size === "MEDIUM" ? "text-4xl" : "text-6xl")
        )}>
           {piece.side}
        </div>
      </motion.div>
    );
  };

  const renderInventory = (side: PlayerSide) => {
    const isInventoryOwner = mySide === side;
    const inventory = gb.inventory[side];
    
    // Group inventory pieces by size for cleaner display
    const smalls = inventory.filter(p => p.size === "SMALL");
    const mediums = inventory.filter(p => p.size === "MEDIUM");
    const larges = inventory.filter(p => p.size === "LARGE");

    const renderStack = (pieces: GobblerPiece[]) => {
      if (pieces.length === 0) {
        return <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/10 border-2 border-slate-700/30 border-dashed flex-shrink-0" />;
      }
      const topPiece = pieces[0]; // just render the top of the 'deck' 
      const count = pieces.length;
      const isSelected = selectedInventoryPieceId === topPiece.id;

      return (
        <div 
          className={clsx(
            "relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 cursor-pointer bg-slate-800/20 rounded-2xl transition-colors border-2 border-slate-700/30",
            isInventoryOwner && !isSelected && "hover:bg-slate-800/60 hover:border-slate-600/50 hover:shadow-lg",
            isSelected && "bg-slate-800/80 border-yellow-500/50"
          )}
          onClick={() => isInventoryOwner && handleInventoryClick(topPiece.id)}
        >
           {/* Visual stacking effect for multiple pieces */}
           {count > 1 && (
             <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
               <div className={clsx(
                 "rounded-full opacity-40 translate-x-1.5 translate-y-1.5",
                 SIZE_STYLES[topPiece.size]['inventory'],
                 COLOR_STYLES[topPiece.side]
               )} />
             </div>
           )}
           <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              {renderPiece(topPiece, isSelected, 'inventory')}
           </div>
           
           <div className="absolute -bottom-2 -right-2 bg-slate-800 text-slate-300 text-[10px] font-black px-2 py-0.5 rounded-lg border-2 border-slate-700 z-20 shadow-md">
             x{count}
           </div>
        </div>
      );
    }

    return (
      <div className={clsx(
        "flex flex-col gap-2 p-4 rounded-2xl border transition-colors",
        isInventoryOwner && room.status === RoomStatus.PLAYING && gb.currentTurn === side ? "bg-slate-800/50 border-indigo-500/30" : "bg-slate-900/50 border-slate-800",
      )}>
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-4">
          {side} Inventory
        </h4>
        <div className="flex gap-6 sm:gap-8 justify-center">
            {renderStack(smalls)}
            {renderStack(mediums)}
            {renderStack(larges)}
        </div>
      </div>
    );
  };

  const getPlayerDetails = (playerId?: string) => {
    return room.players.find(p => p.socketId === playerId);
  };

  const pX = getPlayerDetails(gb.playerXId);
  const pO = getPlayerDetails(gb.playerOId);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      {room.status === RoomStatus.LOBBY && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl font-black text-center mb-4 bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-transparent">Gobbler Tic-Tac-Toe</h2>
          <p className="text-slate-400 text-center mb-8 font-medium">Larger pieces can gobble smaller ones! Select your side to begin.</p>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => gobblerJoinSide("X")}
              className={clsx(
                "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                gb.playerXId === socketId ? "border-indigo-500 bg-indigo-500/20" : 
                gb.playerXId ? "border-slate-800 bg-slate-900 opacity-50 cursor-not-allowed" : 
                "border-slate-800 bg-slate-900 hover:border-indigo-500/50"
              )}
              disabled={!!gb.playerXId && gb.playerXId !== socketId}
            >
              <div className="text-4xl font-black text-indigo-400">X</div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{pX ? pX.name : "Join as X"}</div>
            </button>

            <button
              onClick={() => gobblerJoinSide("O")}
              className={clsx(
                "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                gb.playerOId === socketId ? "border-rose-500 bg-rose-500/20" : 
                gb.playerOId ? "border-slate-800 bg-slate-900 opacity-50 cursor-not-allowed" : 
                "border-slate-800 bg-slate-900 hover:border-rose-500/50"
              )}
              disabled={!!gb.playerOId && gb.playerOId !== socketId}
            >
              <div className="text-4xl font-black text-rose-400">O</div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{pO ? pO.name : "Join as O"}</div>
            </button>
          </div>
        </div>
      )}

      {room.status !== RoomStatus.LOBBY && (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[200px_1fr_200px] gap-8 items-center min-h-[500px]">
          
          {/* Player X Info & Inventory */}
          <div className="flex flex-col gap-6 order-2 md:order-1 items-center md:items-stretch">
            <div className={clsx(
              "bg-slate-900 border-2 rounded-2xl p-4 text-center transition-colors shadow-lg relative overflow-hidden",
              gb.currentTurn === "X" && room.status === RoomStatus.PLAYING ? "border-indigo-500" : "border-slate-800"
            )}>
              {gb.currentTurn === "X" && room.status === RoomStatus.PLAYING && (
                 <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 animate-pulse" />
              )}
              <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-inner border border-slate-700">
                {pX ? getAvatarEmoji(pX.id) : "👤"}
              </div>
              <div className="text-xl font-black text-white mb-1">{pX ? pX.name : "Player X"}</div>
              <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Team X</div>
            </div>
            {renderInventory("X")}
          </div>

          {/* Board */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl order-1 md:order-2 flex flex-col items-center justify-center relative">
            
            {/* Turn Indicator */}
            {room.status === RoomStatus.PLAYING && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/80 px-6 py-2 rounded-full border border-slate-800 shadow-lg backdrop-blur-sm z-20">
                <span className={clsx(
                  "text-sm font-black uppercase tracking-widest",
                  gb.currentTurn === mySide ? "text-green-400" : "text-slate-400"
                )}>
                  {gb.currentTurn === mySide ? "Your Turn" : `${gb.currentTurn}'s Turn`}
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-[400px] w-full aspect-square relative z-10 mt-8">
              {gb.board.map((cellStack, idx) => {
                const isWinningCell = gb.winningLine?.includes(idx);
                const canPlaceHere = (selectedInventoryPieceId && isMyTurn) || (selectedBoardIndex !== null && selectedBoardIndex !== idx && isMyTurn);
                const isSelectedCellToMove = selectedBoardIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    className={clsx(
                      "bg-slate-950/50 border-2 rounded-2xl relative overflow-hidden transition-all group flex items-center justify-center",
                      isSelectedCellToMove ? "border-yellow-500/80 bg-yellow-500/10 shadow-[inset_0_0_20px_rgba(250,204,21,0.2)]" :
                      isWinningCell ? "border-green-500 bg-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.3)] z-10 scale-105" :
                      canPlaceHere ? "border-slate-700 hover:border-slate-500 hover:bg-slate-900" : "border-slate-800",
                      // Allow cursor feedback
                      isMyTurn ? "cursor-pointer" : "cursor-default"
                    )}
                  >
                    <AnimatePresence>
                      {cellStack.map((piece, pieceIdx) => {
                         // We render all pieces in the stack, but only the topmost might have hover/selected effects natively applied via CSS if needed
                         // Absolute positioning centers them all
                         const isTopMost = pieceIdx === cellStack.length - 1;
                         return (
                            <div key={piece.id} className={clsx("absolute inset-0 w-full h-full flex items-center justify-center", !isTopMost && "opacity-0 pointer-events-none")}>
                                {renderPiece(piece, isSelectedCellToMove && isTopMost, 'board')}
                            </div>
                         )
                      })}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
            
            {/* Result Overlay */}
            {room.status === RoomStatus.RESULT && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-50"
              >
                {gb.winner === "DRAW" ? (
                  <>
                    <div className="text-6xl mb-4">🤝</div>
                    <div className="text-4xl font-black text-slate-300 uppercase tracking-widest mb-2">Draw!</div>
                    <div className="text-slate-400 font-medium mb-8">It's a tie! No one wins this round.</div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">🏆</div>
                    <div className="text-4xl font-black uppercase tracking-widest mb-2" style={{ color: gb.winner === "X" ? "#818cf8" : "#fb7185" }}>
                      {gb.winner} Wins!
                    </div>
                    <div className="text-slate-400 font-medium mb-8">
                       {gb.winner === "X" ? pX?.name : pO?.name} has won the match!
                    </div>
                  </>
                )}
                
                {(room.roomHostId === socketId || mySide) && (
                  <button
                    onClick={gobblerReset}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 uppercase tracking-widest text-lg"
                  >
                    Play Again
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* Player O Info & Inventory */}
          <div className="flex flex-col gap-6 order-3 items-center md:items-stretch">
             <div className={clsx(
              "bg-slate-900 border-2 rounded-2xl p-4 text-center transition-colors shadow-lg relative overflow-hidden",
              gb.currentTurn === "O" && room.status === RoomStatus.PLAYING ? "border-rose-500" : "border-slate-800"
            )}>
              {gb.currentTurn === "O" && room.status === RoomStatus.PLAYING && (
                 <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse" />
              )}
              <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-inner border border-slate-700">
                {pO ? getAvatarEmoji(pO.id) : "👤"}
              </div>
              <div className="text-xl font-black text-white mb-1">{pO ? pO.name : "Player O"}</div>
              <div className="text-sm font-bold text-rose-400 uppercase tracking-widest">Team O</div>
            </div>
            {renderInventory("O")}
          </div>

        </div>
      )}
    </div>
  );
}
