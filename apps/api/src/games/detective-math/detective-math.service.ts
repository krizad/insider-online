import { Injectable, Logger } from '@nestjs/common';
import {
  RoomState,
  RoomStatus,
  DetectiveMathPhase,
  DetectiveMathState,
  DetectiveMathRole,
  DetectiveMathPlayer,
} from '@repo/types';

@Injectable()
export class DetectiveMathService {
  private readonly logger = new Logger(DetectiveMathService.name);
  private readonly standardDeck: string[];

  constructor() {
    const suits = ['S', 'H', 'D', 'C'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.standardDeck = suits.flatMap((suit) => ranks.map((rank) => `${rank}-${suit}`));
  }

  private drawCards(state: DetectiveMathState, player: DetectiveMathPlayer, count: number) {
    for (let i = 0; i < count; i++) {
      if (!state.deck || state.deck.length === 0) {
        if (state.discardPile && state.discardPile.length > 0) {
          state.deck = [...state.discardPile].sort(() => 0.5 - Math.random());
          state.discardPile = [];
        } else {
          state.deck = [...this.standardDeck].sort(() => 0.5 - Math.random());
          state.discardPile = [];
        }
      }

      const card = state.deck!.pop();
      if (card) player.hand.push(card);
    }
  }

  startGame(room: RoomState, requesterId: string): RoomState | null {
    if (room.players.length < 3) return null;
    if (room.roomHostId !== requesterId) return null;

    const shuffledPlayers = [...room.players].sort(() => 0.5 - Math.random());
    const informer = shuffledPlayers[0];
    const conspirator = shuffledPlayers[1];

    const deck = [...this.standardDeck].sort(() => 0.5 - Math.random());
    const discardPile: string[] = [];
    const playersRecord: Record<string, DetectiveMathPlayer> = {};

    const state: DetectiveMathState = {
      currentPhase: DetectiveMathPhase.SETUP,
      informerId: informer.socketId,
      conspiratorId: conspirator.socketId,
      targetNumber: null,
      conspiratorRange: undefined,
      activePlayerId: null,
      players: playersRecord,
      playOrder: [],
      round1StarterId: informer.socketId,
      deck,
      discardPile,
    };

    shuffledPlayers.forEach((player) => {
      let role = DetectiveMathRole.DETECTIVE;
      if (player.socketId === informer.socketId) role = DetectiveMathRole.INFORMER;
      if (player.socketId === conspirator.socketId) role = DetectiveMathRole.CONSPIRATOR;

      playersRecord[player.socketId] = {
        id: player.socketId,
        role,
        score: player.score || 0,
        hand: [],
        playedCards: [],
        votedFor: null,
      };

      this.drawCards(state, playersRecord[player.socketId], 5);
    });

    room.status = RoomStatus.PLAYING;
    room.detectiveMathState = state;

    return room;
  }

  submitNumber(room: RoomState, playerId: string, targetNumber: number): RoomState | null {
    if (!room.detectiveMathState) return null;
    const state = room.detectiveMathState;

    if (state.currentPhase !== DetectiveMathPhase.SETUP) return null;
    if (playerId !== state.informerId) return null;

    state.targetNumber = targetNumber;
    
    // Generate a range for the conspirator with width 20, ending in 0 (e.g. 40-60)
    const validRangeMins: number[] = [];
    const start10 = Math.ceil((targetNumber - 20) / 10) * 10;
    for (let i = start10; i <= targetNumber; i += 10) {
      if ((i + 10) !== targetNumber) { // Ensure target is not exactly in the middle
        validRangeMins.push(i);
      }
    }
    const rangeMin = validRangeMins[Math.floor(Math.random() * validRangeMins.length)]!;
    const rangeMax = rangeMin + 20;
    state.conspiratorRange = [rangeMin, rangeMax];

    state.currentPhase = DetectiveMathPhase.PLAYING_ROUND_1;

    const playerIds = room.players.map((p) => p.socketId);
    const informerIndex = playerIds.indexOf(state.informerId);
    state.playOrder = [];
    for (let i = 0; i < playerIds.length; i++) {
      state.playOrder.push(playerIds[(informerIndex + i) % playerIds.length]);
    }

    state.activePlayerId = state.informerId;

    return room;
  }

  playCard(room: RoomState, playerId: string, cardIndex: number): RoomState | null {
    if (!room.detectiveMathState) return null;
    const state = room.detectiveMathState;

    if (
      state.currentPhase !== DetectiveMathPhase.PLAYING_ROUND_1 &&
      state.currentPhase !== DetectiveMathPhase.PLAYING_ROUND_2
    ) {
      return null;
    }

    if (playerId !== state.activePlayerId) return null;

    const player = state.players[playerId];
    if (!player || cardIndex < 0 || cardIndex >= player.hand.length) return null;

    const playedCard = player.hand.splice(cardIndex, 1)[0]!;
    player.playedCards.push(playedCard);

    this.drawCards(state, player, 1);

    const currentIndex = state.playOrder.indexOf(playerId);
    let nextIndex = (currentIndex + 1) % state.playOrder.length;
    let nextPlayerId = state.playOrder[nextIndex];

    const activePlayerIds = new Set(room.players.filter((p) => p.connected !== false).map((p) => p.socketId));
    let skippedCount = 0;
    while (!activePlayerIds.has(nextPlayerId) && skippedCount < state.playOrder.length) {
      nextIndex = (nextIndex + 1) % state.playOrder.length;
      nextPlayerId = state.playOrder[nextIndex];
      skippedCount++;
    }

    if (nextIndex <= currentIndex && skippedCount > 0 || nextIndex === 0) {
      if (state.currentPhase === DetectiveMathPhase.PLAYING_ROUND_1) {
        state.currentPhase = DetectiveMathPhase.PLAYING_ROUND_2;
        state.activePlayerId = state.playOrder.find((id) => activePlayerIds.has(id)) || state.playOrder[0];
      } else {
        state.currentPhase = DetectiveMathPhase.DISCUSSION;
        state.activePlayerId = state.playOrder.find((id) => activePlayerIds.has(id)) || state.playOrder[0];
      }
    } else {
      state.activePlayerId = nextPlayerId;
    }

    return room;
  }

  nextPhase(room: RoomState, requesterId: string): RoomState | null {
    if (!room.detectiveMathState) return null;
    const state = room.detectiveMathState;

    if (state.currentPhase === DetectiveMathPhase.DISCUSSION) {
      if (room.roomHostId !== requesterId) return null;
      state.currentPhase = DetectiveMathPhase.VOTING;
    }

    return room;
  }

  submitVote(room: RoomState, playerId: string, targetId: string): RoomState | null {
    if (!room.detectiveMathState) return null;
    const state = room.detectiveMathState;

    if (state.currentPhase !== DetectiveMathPhase.VOTING) return null;

    if (playerId === state.informerId) return null;

    const player = state.players[playerId];
    if (!player || !state.players[targetId]) return null;

    player.votedFor = targetId;

    const activePlayerIds = new Set(room.players.map((p) => p.socketId));
    const votingPlayers = Object.values(state.players).filter(
      (p) => p.role !== DetectiveMathRole.INFORMER && activePlayerIds.has(p.id)
    );
    const allVoted = votingPlayers.every((p) => p.votedFor !== null);

    if (allVoted && votingPlayers.length > 0) {
      this.calculateScore(room);
    }

    return room;
  }

  private calculateScore(room: RoomState) {
    const state = room.detectiveMathState!;
    state.currentPhase = DetectiveMathPhase.SCORING;
    state.scoreDeltas = {};

    let conspiratorVotes = 0;
    const votingPlayers = Object.values(state.players).filter((p) => p.role !== DetectiveMathRole.INFORMER);

    votingPlayers.forEach((p: DetectiveMathPlayer) => {
      if (p.votedFor === state.conspiratorId) {
        conspiratorVotes++;
      }
    });

    const SCORE_DETECTIVE_WIN = 3;
    const SCORE_CONSPIRATOR_WIN = 5;
    const SCORE_INFORMER_WIN = 4;

    votingPlayers.forEach((p: DetectiveMathPlayer) => {
      if (p.role === DetectiveMathRole.DETECTIVE && p.votedFor === state.conspiratorId) {
        p.score += SCORE_DETECTIVE_WIN;
        state.scoreDeltas![p.id] = SCORE_DETECTIVE_WIN;
      }
    });

    if (conspiratorVotes <= 1) {
      if (state.players[state.conspiratorId!]) {
        state.players[state.conspiratorId!].score += SCORE_CONSPIRATOR_WIN;
        state.scoreDeltas![state.conspiratorId!] =
          (state.scoreDeltas![state.conspiratorId!] || 0) + SCORE_CONSPIRATOR_WIN;
      }
      if (state.players[state.informerId!]) {
        state.players[state.informerId!].score += SCORE_INFORMER_WIN;
        state.scoreDeltas![state.informerId!] = (state.scoreDeltas![state.informerId!] || 0) + SCORE_INFORMER_WIN;
      }
    }

    Object.values(state.players).forEach((p) => {
      if (state.scoreDeltas![p.id] === undefined) {
        state.scoreDeltas![p.id] = 0;
      }
    });

    Object.values(state.players).forEach((p: DetectiveMathPlayer) => {
      const roomPlayer = room.players.find((rp) => rp.socketId === p.id);
      if (roomPlayer) {
        roomPlayer.score = p.score;
      }
    });
  }

  nextRound(room: RoomState, requesterId: string): RoomState | null {
    if (!room.detectiveMathState) return null;
    if (room.roomHostId !== requesterId) return null;

    const state = room.detectiveMathState;
    if (state.currentPhase !== DetectiveMathPhase.SCORING) return null;

    const playerIds = room.players.map((p) => p.socketId);
    let nextInformerId = state.informerId!;
    const currentIndex = playerIds.indexOf(state.informerId!);
    if (currentIndex !== -1) {
      nextInformerId = playerIds[(currentIndex + 1) % playerIds.length]!;
    } else if (playerIds.length > 0) {
      nextInformerId = playerIds[0]!;
    }

    const nonInformerPlayers = playerIds.filter((id) => id !== nextInformerId);
    const randomConspiratorIndex = Math.floor(Math.random() * nonInformerPlayers.length);
    const nextConspiratorId = nonInformerPlayers[randomConspiratorIndex]!;

    if (!state.discardPile) state.discardPile = [];

    Object.values(state.players).forEach((p: DetectiveMathPlayer) => {
      if (p.playedCards && p.playedCards.length > 0) {
        state.discardPile!.push(...p.playedCards);
      }

      p.role = DetectiveMathRole.DETECTIVE;
      if (p.id === nextInformerId) p.role = DetectiveMathRole.INFORMER;
      if (p.id === nextConspiratorId) p.role = DetectiveMathRole.CONSPIRATOR;

      while (p.hand.length < 5) this.drawCards(state, p, 1);

      p.playedCards = [];
      p.votedFor = null;
    });

    state.currentPhase = DetectiveMathPhase.SETUP;
    state.informerId = nextInformerId;
    state.conspiratorId = nextConspiratorId;
    state.targetNumber = null;
    state.conspiratorRange = undefined;
    state.activePlayerId = null;
    state.playOrder = [];
    state.round1StarterId = nextInformerId;

    return room;
  }
}
