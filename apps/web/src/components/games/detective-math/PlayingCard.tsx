import { cn } from "@/lib/utils";

interface PlayingCardProps {
  rank: string;
  suit: string;
  className?: string;
}

export function PlayingCard({ rank, suit, className }: Readonly<PlayingCardProps>) {
  const isRed = suit === 'H' || suit === 'D';
  
  const getSuitChar = (s: string) => {
    switch (s) {
      case 'S': return '♠';
      case 'H': return '♥';
      case 'D': return '♦';
      case 'C': return '♣';
      default: return '';
    }
  };
  const suitChar = getSuitChar(suit);
  
  // Transform 'T' back to '10' if necessary
  const displayRank = rank === 'T' ? '10' : rank;

  return (
    <div className={cn(
        "relative bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden flex flex-col select-none", 
        className
    )}>
      {/* Top Left */}
      <div className={cn(
        "absolute top-1 sm:top-2 left-1.5 sm:left-2 flex flex-col items-center",
        isRed ? "text-rose-600" : "text-slate-800"
      )}>
        <span className="text-sm sm:text-lg font-bold leading-none">{displayRank}</span>
        <span className="text-sm sm:text-xl leading-none">{suitChar}</span>
      </div>

      {/* Bottom Right (Upside Down) */}
      <div className={cn(
        "absolute bottom-1 sm:bottom-2 right-1.5 sm:right-2 flex flex-col items-center rotate-180",
        isRed ? "text-rose-600" : "text-slate-800"
      )}>
        <span className="text-sm sm:text-lg font-bold leading-none">{displayRank}</span>
        <span className="text-sm sm:text-xl leading-none">{suitChar}</span>
      </div>

      {/* Center Giant Suit */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none",
        isRed ? "text-rose-600" : "text-slate-800"
      )}>
        <span className="text-5xl sm:text-7xl">{suitChar}</span>
      </div>
    </div>
  );
}
