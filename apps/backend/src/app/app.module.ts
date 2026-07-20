import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PullRequestsModule } from './pull-requests/pull-requests.module';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    // 1. Betöltjük a .env fájlt és globálissá tesszük
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 2. Beállítjuk az adatbázis kapcsolatot
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true, // Automatikusan betölti a regisztrált Entity-ket
        synchronize: true,      // DEV KÖRNYEZETBEN: automatikusan létrehozza a táblákat
      }),
    }),

    // Redis kapcsolat beállítása globálisan
    BullModule.forRoot({
      connection: {
        host: 'localhost', // Ha dockerben fut a Redis, vagy a .env-ből is jöhet
        port: 6379,
      },
    }),
    PullRequestsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}