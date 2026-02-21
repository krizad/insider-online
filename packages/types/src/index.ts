export enum RoomStatus {
  LOBBY = 'LOBBY',
  WORD_SETTING = 'WORD_SETTING',
  QUESTIONING = 'QUESTIONING',
  VOTING = 'VOTING',
  RESULT = 'RESULT',
}

export enum Role {
  Host = 'Host',
  Know = 'Know',
  Unknow = 'Unknow',
}

export type WinningTeam = 'INSIDER' | 'COMMONERS' | 'TIMEOUT';

// Socket Constants
export const SOCKET_EVENTS = {
  JOIN_ROOM: 'join_room',
  ROOM_STATE_UPDATED: 'room_state_updated',
  START_GAME: 'start_game',
  ROLE_ASSIGNED: 'role_assigned',
  SET_WORD: 'set_word',
  WORD_SETTING_COMPLETED: 'word_setting_completed',
  END_QUESTIONING: 'end_questioning',
  TIMER_UPDATE: 'timer_update',
  SUBMIT_VOTE: 'submit_vote',
  RESET_GAME: 'reset_game',
  UPDATE_CONFIG: 'update_config',
  ERROR: 'error',
} as const;

export interface UserState {
  id: string;
  name: string;
  socketId: string;
  role?: Role;
  score: number;
  roomId: string;
  hasBeenHost?: boolean;
}

export interface RoomConfig {
  hostSelection: 'ROUND_ROBIN' | 'RANDOM' | 'FIXED';
  timerMin: number;
}

export interface RoomState {
  id: string;
  code: string;
  status: RoomStatus;
  roomHostId: string;
  players: UserState[];
  createdAt: Date;
  endTime?: number;
  votes?: Record<string, string>;
  winner?: WinningTeam;
  config: RoomConfig;
}
