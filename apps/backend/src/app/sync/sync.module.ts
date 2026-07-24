import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { PullRequestEntity } from '../pull-requests/entities/pull-request.entity';
import { GithubSyncController } from './controllers/github-sync.controller';
import { GithubSyncService } from './services/github-sync.service';
import { GithubSyncProcessor } from './processors/github-sync.processor';
import { SyncEventsGateway } from './gateaways/sync-events.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([PullRequestEntity]),
    BullModule.registerQueue({
      name: 'github-sync-queue',
    }),
  ],
  providers: [
    GithubSyncService,
    GithubSyncProcessor,
    SyncEventsGateway
  ],
  controllers: [GithubSyncController],
  exports: [GithubSyncService]
})
export class SyncModule {}