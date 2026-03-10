import { Injectable } from '@nestjs/common';
import { RoomState, RoomStatus, Role, UserState, GameType, TicTacToeCell, RPSChoice } from '@repo/types';
import { v4 as uuidv4 } from 'uuid';
import { WhoKnowService } from './who-know/who-know.service';
import { TicTacToeService } from './tic-tac-toe/tic-tac-toe.service';
import { RPSService } from './rps/rps.service';
import { GobblerService } from './gobbler/gobbler.service';
import { SoundsFishyService } from './sounds-fishy/sounds-fishy.service';

@Injectable()
export class GamesService {
  private rooms: Map<string, RoomState> = new Map();
  private readonly secretWords: Map<string, string> = new Map();

  constructor(
    private readonly whoKnowService: WhoKnowService,
    private readonly ticTacToeService: TicTacToeService,
    private readonly rpsService: RPSService,
    private readonly gobblerService: GobblerService,
    private readonly soundsFishyService: SoundsFishyService,
  ) {}

  createRoom(hostId: string, gameType: GameType = GameType.WHO_KNOW): RoomState {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room: RoomState = {
      id: uuidv4(),
      gameType,
      code,
      status: RoomStatus.LOBBY,
      roomHostId: hostId,
      players: [],
      createdAt: new Date(),
      config: {
        hostSelection: 'ROUND_ROBIN',
        timerMin: 5,
        rpsBestOf: 3,
        rpsMode: '1V1_ROUND_ROBIN'
      }
    };

    if (gameType === GameType.TIC_TAC_TOE) {
      room.ticTacToeState = {
        board: Array(9).fill(null),
        currentTurn: "X"
      };
    } else if (gameType === GameType.RPS) {
      room.rpsState = {
        activePlayers: [],
        queue: [],
        choices: {},
        scores: {},
      };
    } else if (gameType === GameType.GOBBLER_TIC_TAC_TOE) {
      room.gobblerState = {
        board: Array.from({ length: 9 }, () => []),
        currentTurn: "X",
        inventory: {
          X: [
            { id: uuidv4(), side: "X", size: "SMALL" },
            { id: uuidv4(), side: "X", size: "SMALL" },
            { id: uuidv4(), side: "X", size: "MEDIUM" },
            { id: uuidv4(), side: "X", size: "MEDIUM" },
            { id: uuidv4(), side: "X", size: "LARGE" },
            { id: uuidv4(), side: "X", size: "LARGE" },
          ],
          O: [
            { id: uuidv4(), side: "O", size: "SMALL" },
            { id: uuidv4(), side: "O", size: "SMALL" },
            { id: uuidv4(), side: "O", size: "MEDIUM" },
            { id: uuidv4(), side: "O", size: "MEDIUM" },
            { id: uuidv4(), side: "O", size: "LARGE" },
            { id: uuidv4(), side: "O", size: "LARGE" },
          ],
        },
        scores: { X: 0, O: 0 }
      };
    }

    this.rooms.set(code, room);
    return room;
  }

  joinRoom(code: string, user: Omit<UserState, 'score' | 'roomId' | 'role'>): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    const existingPlayer = room.players.find(p => p.name === user.name);
    
    if (existingPlayer) {
      const oldSocketId = existingPlayer.socketId;
      existingPlayer.socketId = user.socketId;
      existingPlayer.connected = true;
      
      if (room.roomHostId === oldSocketId) {
        room.roomHostId = user.socketId;
      }
      
      if (room.votes) {
        if (room.votes[oldSocketId]) {
          room.votes[user.socketId] = room.votes[oldSocketId];
          delete room.votes[oldSocketId];
        }
        
        Object.entries(room.votes).forEach(([voterId, targetId]) => {
          if (targetId === oldSocketId) {
            room.votes![voterId] = user.socketId;
          }
        });
      }
    } else {
      room.players.push({
        ...user,
        score: 0,
        roomId: room.id,
        connected: true,
      });
    }

    this.rooms.set(code, room);
    return room;
  }

  leaveRoom(clientId: string, explicitLeave: boolean = false): RoomState | null | { code: null } {
    for (const [code, room] of this.rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.socketId === clientId);
      if (playerIndex !== -1) {
        if (room.roomHostId === clientId) {
          if (explicitLeave || room.status === RoomStatus.LOBBY) {
            this.rooms.delete(code);
            this.secretWords.delete(code);
            return { code: null }; 
          }
        }

        if (explicitLeave || room.status === RoomStatus.LOBBY) {
          room.players.splice(playerIndex, 1);
        } else {
          room.players[playerIndex].connected = false;
        }
        
        const activePlayers = room.players.filter(p => p.connected !== false).length;
        if (activePlayers === 0) {
          this.rooms.delete(code);
          this.secretWords.delete(code);
          return null;
        }

        this.rooms.set(code, room);
        return room;
      }
    }
    return null;
  }

  getRoom(code: string): RoomState | undefined {
    return this.rooms.get(code);
  }

  getAvailableRooms(): { code: string; gameType: GameType; hostName: string; playerCount: number }[] {
    const availableRooms = [];
    for (const room of this.rooms.values()) {
      if (room.status === RoomStatus.LOBBY) {
        availableRooms.push({
          code: room.code,
          gameType: room.gameType,
          hostName: room.players.find(p => p.socketId === room.roomHostId)?.name || 'Unknown',
          playerCount: room.players.length
        });
      }
    }
    return availableRooms;
  }

  updateConfig(code: string, requesterId: string, config: Partial<RoomState['config']>): RoomState | null {
    const room = this.rooms.get(code);
    if (!room || room.status !== RoomStatus.LOBBY) return null;

    if (room.roomHostId !== requesterId) return null; 
    
    room.config = { ...room.config, ...config };
    this.rooms.set(code, room);
    return room;
  }

  // --- Delegation to Game Services ---
  
  async assignRoles(code: string, requesterId: string): Promise<{ room: RoomState, roles: Record<string, Role> } | null> {
    const room = this.rooms.get(code);
    if (!room) return null;

    if (room.gameType === GameType.SOUNDS_FISHY) {
      const result = await this.soundsFishyService.assignRoles(room, requesterId);
      if (result) this.rooms.set(code, result.room);
      return result;
    }

    if (room.gameType === GameType.RPS) {
      const result = this.rpsService.assignRoles(room, requesterId);
      if (result) this.rooms.set(code, result.room);
      return result;
    } 
    
    // Default to WHO_KNOW
    const result = this.whoKnowService.assignRoles(room, requesterId);
    if (result) this.rooms.set(code, result.room);
    return result;
  }

  setWord(code: string, word: string, requesterId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.whoKnowService.setWord(room, word, requesterId, this.secretWords);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  stopTimer(code: string, requesterId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.whoKnowService.stopTimer(room, requesterId);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  endQuestioning(code: string, requesterId: string, timeout: boolean = false): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.whoKnowService.endQuestioning(room, requesterId, timeout);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  submitVote(code: string, voterId: string, targetId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.whoKnowService.submitVote(room, voterId, targetId);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  resetGame(code: string, requesterId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.whoKnowService.resetGame(room, requesterId, this.secretWords);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  getSecretWord(code: string): string | undefined {
    return this.secretWords.get(code);
  }

  // --- Tic-Tac-Toe Logic ---

  tttJoinSide(code: string, clientId: string, side: "X" | "O"): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.ticTacToeService.joinSide(room, clientId, side);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  tttMakeMove(code: string, clientId: string, index: number): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.ticTacToeService.makeMove(room, clientId, index);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  tttReset(code: string, clientId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.ticTacToeService.reset(room, clientId);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  // --- RPS Logic ---

  rpsMakeChoice(code: string, clientId: string, choice: RPSChoice): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.rpsService.makeChoice(room, clientId, choice);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  rpsNextRound(code: string, clientId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.rpsService.nextRound(room, clientId);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  rpsReset(code: string, clientId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.rpsService.reset(room, clientId);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  // --- Gobbler Tic-Tac-Toe Logic ---

  gobblerJoinSide(code: string, clientId: string, side: "X" | "O"): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.gobblerService.joinSide(room, clientId, side);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  gobblerPlacePiece(code: string, clientId: string, pieceId: string, toIndex: number): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.gobblerService.placePiece(room, clientId, pieceId, toIndex);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  gobblerMovePiece(code: string, clientId: string, fromIndex: number, toIndex: number): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.gobblerService.movePiece(room, clientId, fromIndex, toIndex);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  gobblerReset(code: string, clientId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.gobblerService.reset(room, clientId);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  // --- Sounds Fishy Logic ---
  soundsFishyTypeAnswer(code: string, clientId: string, answer: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.soundsFishyService.typeAnswer(room, clientId, answer);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  soundsFishySubmitAnswer(code: string, clientId: string, answer: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.soundsFishyService.submitAnswer(room, clientId, answer);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  soundsFishyRevealPlayer(code: string, clientId: string, targetId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.soundsFishyService.revealPlayer(room, clientId, targetId);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  soundsFishyEliminatePlayer(code: string, clientId: string, targetId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.soundsFishyService.eliminatePlayer(room, clientId, targetId);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  soundsFishyBankPoints(code: string, clientId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.soundsFishyService.bankPoints(room, clientId);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  soundsFishyNextRound(code: string, clientId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    const updatedRoom = this.soundsFishyService.nextRound(room, clientId);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  soundsFishyReset(code: string, clientId: string): RoomState | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    // We can reuse the same nextRound logic to reset back to lobby
    const updatedRoom = this.soundsFishyService.nextRound(room, clientId);
    if (updatedRoom) this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }
}

