import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
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
    StandingsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        // Auth routes
        { path: 'api/auth/(.*)', method: RequestMethod.POST },

        // Public fields GET
        { path: 'api/fields', method: RequestMethod.GET },
        { path: 'api/fields/*', method: RequestMethod.GET },

        // Public tournaments GET (includes standings, matches list, details)
        { path: 'api/tournaments', method: RequestMethod.GET },
        { path: 'api/tournaments/*', method: RequestMethod.GET },

        // Public matches GET
        { path: 'api/matches/*', method: RequestMethod.GET },

        // Public users list GET
        { path: 'api/users', method: RequestMethod.GET }
      )
      .forRoutes('*');
  }
}
