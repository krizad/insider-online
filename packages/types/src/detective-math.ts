export enum DetectiveMathPhase {
  SETUP = "SETUP",
  PLAYING_ROUND_1 = "PLAYING_ROUND_1",
  PLAYING_ROUND_2 = "PLAYING_ROUND_2",
  DISCUSSION = "DISCUSSION",
  VOTING = "VOTING",
  SCORING = "SCORING",
}

export enum DetectiveMathRole {
  INFORMER = "INFORMER",
  CONSPIRATOR = "CONSPIRATOR",
  DETECTIVE = "DETECTIVE",
}

export interface DetectiveMathPlayer {
  id: string; // socketId
  role: DetectiveMathRole;
  score: number;
  hand: string[]; // Standard card strings like "A-S", "10-H", etc.
  playedCards: string[];
  votedFor: string | null;
}

export interface DetectiveMathState {
  currentPhase: DetectiveMathPhase;
  informerId: string | null;
  conspiratorId: string | null;
  targetNumber: number | null; // The number set by the informer
  conspiratorRange?: [number, number]; // Range of numbers shown to the conspirator
  activePlayerId: string | null; // Whose turn is it to play a card
  playOrder: string[]; // Order of socketIds for the round
  round1StarterId: string | null; // The informer starts round 1
  scoreDeltas?: Record<string, number>; // Points gained in the current round
  deck?: string[]; // Deck of cards to draw from
  discardPile?: string[]; // Cards that have been played in previous rounds
  players: Record<string, DetectiveMathPlayer>; // Player states
}
