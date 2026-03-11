import { Test, TestingModule } from '@nestjs/testing';
import { DetectiveMathService } from './detective-math.service';
import {
  GameType,
  RoomState,
  RoomStatus,
  DetectiveMathPhase,
  DetectiveMathRole,
} from '@repo/types';

describe('DetectiveMathService', () => {
  let service: DetectiveMathService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetectiveMathService],
    }).compile();

    service = module.get<DetectiveMathService>(DetectiveMathService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const generateMockRoom = (numPlayers: number): RoomState => {
    const players = Array.from({ length: numPlayers }).map((_, i) => ({
      id: `socket${i}`,
      name: `Player ${i}`,
      socketId: `socket${i}`,
      score: 0,
      roomId: 'room1',
      connected: true,
    }));

    return {
      id: 'room1',
      code: 'TEST',
      gameType: GameType.DETECTIVE_MATH,
      status: RoomStatus.LOBBY,
      roomHostId: 'socket0',
      players,
      createdAt: new Date(),
      config: {
        hostSelection: 'ROUND_ROBIN',
        timerMin: 5,
      },
    };
  };

  it('should start game with correct number of players and state', () => {
    const room = generateMockRoom(4);
    const startedRoom = service.startGame(room, 'socket0');

    expect(startedRoom).toBeDefined();
    expect(startedRoom?.status).toBe(RoomStatus.PLAYING);

    const state = startedRoom?.detectiveMathState!;
    expect(state).toBeDefined();
    expect(state.targetNumber).toBe(null);

    // Initial hands
    let totalCardsInHands = 0;
    Object.values(state.players).forEach(p => {
      expect(p.hand.length).toBe(5);
      expect(p.hand[0]).toMatch(/^[2-91JQKA]+-[SHDC]+$/); // Handled standard card format
      totalCardsInHands += p.hand.length;
    });

    expect(state.deck!.length).toBe(52 - totalCardsInHands);

    let informerCount = 0;
    let conspiratorCount = 0;
    let detectiveCount = 0;

    Object.values(state.players).forEach(p => {
      if (p.role === DetectiveMathRole.INFORMER) informerCount++;
      if (p.role === DetectiveMathRole.CONSPIRATOR) conspiratorCount++;
      if (p.role === DetectiveMathRole.DETECTIVE) detectiveCount++;
    });

    expect(informerCount).toBe(1);
    expect(conspiratorCount).toBe(1);
    expect(detectiveCount).toBe(2);
  });
});
