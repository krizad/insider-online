import { Module } from '@nestjs/common';
import { GamesGateway } from './games.gateway';
import { GamesService } from './games.service';
import { WhoKnowService } from './who-know/who-know.service';
import { TicTacToeService } from './tic-tac-toe/tic-tac-toe.service';
import { RPSService } from './rps/rps.service';
import { GobblerService } from './gobbler/gobbler.service';
import { SoundsFishyService } from './sounds-fishy/sounds-fishy.service';
import { DetectiveClubService } from './detective-club/detective-club.service';
import { DetectiveMathService } from './detective-math/detective-math.service';

@Module({
  providers: [GamesGateway, GamesService, WhoKnowService, TicTacToeService, RPSService, GobblerService, SoundsFishyService, DetectiveClubService, DetectiveMathService]
})
export class GamesModule {}
