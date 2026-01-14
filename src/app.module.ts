import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from './common/middlewares/auth/auth.middleware';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { FieldsModule } from './modules/fields/fields.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { MatchesModule } from './modules/matches/matches.module';
import { PlayersModule } from './modules/players/players.module';
import { StandingsModule } from './modules/standings/standings.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { APP_GUARD } from '@nestjs/core';
import { GlobalGuard } from './common/guards/globalGuard';
import { AuthGuard } from './common/guards/auth/auth.guard';
import { RolesGuard } from './common/guards/roles/roles.guard';
@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    UsersModule,
    AuthModule,
    FieldsModule,
    BookingsModule,
    TournamentsModule,
    TeamsModule,
    PlayersModule,
    MatchesModule,
    StandingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: GlobalGuard,
    },
  ],
})
export class AppModule {}
