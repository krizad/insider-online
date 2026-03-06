import { Module } from '@nestjs/common';
import { GamesGateway } from './games.gateway';
import { GamesService } from './games.service';
import { WhoKnowService } from './who-know/who-know.service';
import { TicTacToeService } from './tic-tac-toe/tic-tac-toe.service';
import { RPSService } from './rps/rps.service';

@Module({
  providers: [GamesGateway, GamesService, WhoKnowService, TicTacToeService, RPSService]
})
export class GamesModule {}
