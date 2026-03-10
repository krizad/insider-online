import { Injectable } from '@nestjs/common';
import {
  RoomState,
  RoomStatus,
  DetectiveClubPhase,
  DetectiveClubState,
  DetectiveClubRole,
  DetectiveClubPlayer,
} from '@repo/types';

const TOTAL_CARDS = 20; // We currently have 20 card images.

@Injectable()
export class DetectiveClubService {
  private getRandomCard(): string {
    const randomNum = Math.floor(Math.random() * TOTAL_CARDS) + 1;
    // We will use local paths as requested by user.
    return `/images/detective-club/${randomNum}.jpg`;
  }

  private generateHand(size: number): string[] {
    const hand: string[] = [];
    for (let i = 0; i < size; i++) {
      hand.push(this.getRandomCard());
    }
    return hand;
  }

  startGame(room: RoomState, requesterId: string): RoomState | null {
    if (room.players.length < 3) return null; // Need at least 3 players
    if (room.roomHostId !== requesterId) return null;

    // Assign roles randomly
    // 1 Informer, 1 Conspirator, rest Detectives
    const shuffledPlayers = [...room.players].sort(() => 0.5 - Math.random());
    const informer = shuffledPlayers[0];
    const conspirator = shuffledPlayers[1];
    const detectives = shuffledPlayers.slice(2);

    const playersRecord: Record<string, DetectiveClubPlayer> = {};

    shuffledPlayers.forEach((player) => {
      let role = DetectiveClubRole.DETECTIVE;
      if (player.socketId === informer.socketId) role = DetectiveClubRole.INFORMER;
      if (player.socketId === conspirator.socketId) role = DetectiveClubRole.CONSPIRATOR;

      playersRecord[player.socketId] = {
        id: player.socketId,
        role,
        score: player.score || 0,
        hand: this.generateHand(6),
        playedCards: [],
        votedFor: null,
      };
    });

    const state: DetectiveClubState = {
      currentPhase: DetectiveClubPhase.SETUP,
      informerId: informer.socketId,
      conspiratorId: conspirator.socketId,
      word: null,
      activePlayerId: null,
      players: playersRecord,
      playOrder: [], // Will be set when word is submitted
      round1StarterId: informer.socketId,
    };

    room.status = RoomStatus.PLAYING;
    room.detectiveClubState = state;

    return room;
  }

  submitWord(room: RoomState, playerId: string, word: string): RoomState | null {
    if (!room.detectiveClubState) return null;
    const state = room.detectiveClubState;

    if (state.currentPhase !== DetectiveClubPhase.SETUP) return null;
    if (playerId !== state.informerId) return null;

    state.word = word;
    state.currentPhase = DetectiveClubPhase.PLAYING_ROUND_1;

    // Generate play order starting from Informer
    const playerIds = room.players.map(p => p.socketId);
    const informerIndex = playerIds.indexOf(state.informerId);
    state.playOrder = [];
    for (let i = 0; i < playerIds.length; i++) {
      state.playOrder.push(playerIds[(informerIndex + i) % playerIds.length]);
    }
    
    state.activePlayerId = state.informerId;

    return room;
  }

  playCard(room: RoomState, playerId: string, cardIndex: number): RoomState | null {
    if (!room.detectiveClubState) return null;
    const state = room.detectiveClubState;

    if (
      state.currentPhase !== DetectiveClubPhase.PLAYING_ROUND_1 &&
      state.currentPhase !== DetectiveClubPhase.PLAYING_ROUND_2
    ) {
      return null;
    }

    if (playerId !== state.activePlayerId) return null;

    const player = state.players[playerId];
    if (!player || cardIndex < 0 || cardIndex >= player.hand.length) return null;

    const playedCard = player.hand.splice(cardIndex, 1)[0]!;
    player.playedCards.push(playedCard);
    // Draw a new card to replace it
    player.hand.push(this.getRandomCard());

    // Next player
    const currentIndex = state.playOrder.indexOf(playerId);
    const nextIndex = (currentIndex + 1) % state.playOrder.length;
    
    // Check if round is over
    if (nextIndex === 0) { // Back to the starter of the round
      if (state.currentPhase === DetectiveClubPhase.PLAYING_ROUND_1) {
        state.currentPhase = DetectiveClubPhase.PLAYING_ROUND_2;
        state.activePlayerId = state.playOrder[0]; // Informer starts again
      } else {
        state.currentPhase = DetectiveClubPhase.DISCUSSION;
        state.activePlayerId = state.playOrder[0]; // Informer starts explaining
      }
    } else {
      state.activePlayerId = state.playOrder[nextIndex];
    }

    return room;
  }

  nextPhase(room: RoomState, requesterId: string): RoomState | null {
    if (!room.detectiveClubState) return null;
    const state = room.detectiveClubState;

    if (state.currentPhase === DetectiveClubPhase.DISCUSSION) {
      // Only host or Informer can move from Discussion to Voting? Let's say Host.
      if (room.roomHostId !== requesterId) return null;
      state.currentPhase = DetectiveClubPhase.VOTING;
    }
    
    return room;
  }

  submitVote(room: RoomState, playerId: string, targetId: string): RoomState | null {
    if (!room.detectiveClubState) return null;
    const state = room.detectiveClubState;

    if (state.currentPhase !== DetectiveClubPhase.VOTING) return null;

    // Informer cannot vote
    if (playerId === state.informerId) return null;

    const player = state.players[playerId];
    if (!player || !state.players[targetId]) return null;

    // Conspirator CAN vote (to blend in).

    player.votedFor = targetId;

    // Check if everyone (except Informer) has voted
    const votingPlayers = Object.values(state.players).filter(p => p.role !== DetectiveClubRole.INFORMER);
    const allVoted = votingPlayers.every(p => p.votedFor !== null);

    if (allVoted) {
      this.calculateScore(room);
    }

    return room;
  }

  private calculateScore(room: RoomState) {
    const state = room.detectiveClubState!;
    state.currentPhase = DetectiveClubPhase.SCORING;

    let conspiratorVotes = 0;
    const votingPlayers = Object.values(state.players).filter(p => p.role !== DetectiveClubRole.INFORMER);
    
    votingPlayers.forEach((p: DetectiveClubPlayer) => {
      if (p.votedFor === state.conspiratorId) {
        conspiratorVotes++;
      }
    });

    const SCORE_DETECTIVE_WIN = 3;
    const SCORE_CONSPIRATOR_WIN = 5;
    const SCORE_INFORMER_WIN = 4;

    if (conspiratorVotes > 1) {
      // Detectives win
      votingPlayers.forEach((p: DetectiveClubPlayer) => {
        if (p.role === DetectiveClubRole.DETECTIVE && p.votedFor === state.conspiratorId) {
          p.score += SCORE_DETECTIVE_WIN;
        }
      });
    } else {
      // Conspirator wins
      state.players[state.conspiratorId!].score += SCORE_CONSPIRATOR_WIN;
      state.players[state.informerId!].score += SCORE_INFORMER_WIN;
    }

    // Update RoomState players copy for consistency
    Object.values(state.players).forEach((p: DetectiveClubPlayer) => {
      const roomPlayer = room.players.find(rp => rp.socketId === p.id);
      if (roomPlayer) {
        roomPlayer.score = p.score;
      }
    });
  }

  nextRound(room: RoomState, requesterId: string): RoomState | null {
    if (!room.detectiveClubState) return null;
    if (room.roomHostId !== requesterId) return null;
    
    const state = room.detectiveClubState;
    if (state.currentPhase !== DetectiveClubPhase.SCORING) return null;

    // Rotate Informer
    const playerIds = room.players.map(p => p.socketId);
    let nextInformerId = state.informerId!;
    const currentIndex = playerIds.indexOf(state.informerId!);
    if (currentIndex !== -1) {
      nextInformerId = playerIds[(currentIndex + 1) % playerIds.length]!;
    }

    // Assign new roles
    const nonInformerPlayers = playerIds.filter(id => id !== nextInformerId);
    const randomConspiratorIndex = Math.floor(Math.random() * nonInformerPlayers.length);
    const nextConspiratorId = nonInformerPlayers[randomConspiratorIndex]!;

    Object.values(state.players).forEach((p: DetectiveClubPlayer) => {
      p.role = DetectiveClubRole.DETECTIVE;
      if (p.id === nextInformerId) p.role = DetectiveClubRole.INFORMER;
      if (p.id === nextConspiratorId) p.role = DetectiveClubRole.CONSPIRATOR;
      
      // Keep hand, keep score, reset playedCards and votedFor
      // Refill hand to 6 if it isn't (it should be 6 because we draw after play, but let's be safe)
      while (p.hand.length < 6) p.hand.push(this.getRandomCard());
      p.playedCards = [];
      p.votedFor = null;
    });

    state.currentPhase = DetectiveClubPhase.SETUP;
    state.informerId = nextInformerId;
    state.conspiratorId = nextConspiratorId;
    state.word = null;
    state.activePlayerId = null;
    state.playOrder = [];
    state.round1StarterId = nextInformerId;

    return room;
  }
}
