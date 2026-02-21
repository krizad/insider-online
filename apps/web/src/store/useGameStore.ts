import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { RoomState, RoomStatus, Role, SOCKET_EVENTS } from '@repo/types';
import { toast } from 'react-hot-toast';

interface GameState {
  socket: Socket | null;
  connected: boolean;
  room: RoomState | null;
  myRole: Role | null;
  myName: string;
  socketId: string;
  secretWord: string | null;
  connect: () => void;
  setName: (name: string) => void;
  createRoom: () => void;
  joinRoom: (code: string) => void;
  startGame: () => void;
  setWord: (word: string) => void;
  endQuestioning: (timeout?: boolean) => void;
  submitVote: (targetId: string) => void;
  resetRoom: () => void;
  updateConfig: (config: Partial<RoomState['config']>) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  socket: null,
  connected: false,
  room: null,
  myRole: null,
  myName: '',
  socketId: '',
  secretWord: null,

  setName: (name) => set({ myName: name }),

  connect: () => {
    if (get().socket) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(apiUrl);

    socket.on('connect', () => {
      set({ connected: true, socket, socketId: socket.id });
    });

    socket.on('disconnect', () => {
      set({ connected: false, socketId: '' });
    });

    socket.on(SOCKET_EVENTS.ROOM_STATE_UPDATED, (room: RoomState) => {
      if (room.status === RoomStatus.LOBBY) {
        set({ room, myRole: null, secretWord: null });
      } else {
        set({ room });
      }
    });

    socket.on(SOCKET_EVENTS.ROLE_ASSIGNED, ({ role }: { role: Role }) => {
      set({ myRole: role });
    });

    socket.on(SOCKET_EVENTS.WORD_SETTING_COMPLETED, ({ word }: { word: string }) => {
      set({ secretWord: word });
    });

    socket.on(SOCKET_EVENTS.ERROR, ({ message }: { message: string }) => {
      toast.error(message);
    });
  },

  createRoom: () => {
    const { socket, myName } = get();
    if (socket && myName) {
      socket.emit('create_room', { name: myName });
    } else if (!myName) {
      toast.error('Please enter your name first');
    }
  },

  joinRoom: (code: string) => {
    const { socket, myName } = get();
    if (socket && myName) {
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, { code, name: myName });
    } else if (!myName) {
      toast.error('Please enter your name first');
    }
  },

  startGame: () => {
    const { socket, room } = get();
    if (socket && room) {
      socket.emit(SOCKET_EVENTS.START_GAME, { code: room.code });
    }
  },

  setWord: (word: string) => {
    const { socket, room } = get();
    if (socket && room) {
      socket.emit(SOCKET_EVENTS.SET_WORD, { code: room.code, word });
    }
  },

  endQuestioning: (timeout: boolean = false) => {
    const { socket, room } = get();
    if (socket && room) {
      socket.emit(SOCKET_EVENTS.END_QUESTIONING, { code: room.code, timeout });
    }
  },

  submitVote: (targetId: string) => {
    const { socket, room } = get();
    if (socket && room) {
      socket.emit(SOCKET_EVENTS.SUBMIT_VOTE, { code: room.code, targetId });
    }
  },

  resetRoom: () => {
    const { socket, room } = get();
    if (socket && room) {
      set({ myRole: null, secretWord: null });
      socket.emit(SOCKET_EVENTS.RESET_GAME, { code: room.code });
    }
  },
  
  updateConfig: (config: Partial<RoomState['config']>) => {
    const { socket, room } = get();
    if (socket && room) {
      socket.emit(SOCKET_EVENTS.UPDATE_CONFIG, { code: room.code, config });
    }
  }
}));
