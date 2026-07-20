import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PullRequestEntity } from './entities/pull-request.enity';
import { GithubSyncService } from './services/github-sync.service';
import { PullRequestsController } from './controllers/pull-requests.controller';
import { GithubSyncController } from './controllers/github-sync.controller';
import { BullModule } from '@nestjs/bullmq';
import { GithubSyncProcessor } from './processors/github-sync.processor';

@Module({
  imports: [
    // Ez mondja meg a TypeORM-nek, hogy "Helló, töltsd be ezt az Entity-t!"
    TypeOrmModule.forFeature([PullRequestEntity]),
    BullModule.registerQueue({
      name: 'github-sync-queue',
    }),
  ],
  providers: [GithubSyncService, GithubSyncProcessor],
  controllers: [PullRequestsController, GithubSyncController], // A Controller-t is regisztrálni kell, hogy a NestJS tudja, hogy létezik
  exports: [TypeOrmModule, GithubSyncService] // Ezt exportáljuk, hogy a jövőbeli Service-ek használhassák
})
export class PullRequestsModule {}