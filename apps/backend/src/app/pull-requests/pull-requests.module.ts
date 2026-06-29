import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PullRequestEntity } from './entities/pull-request.enity';
import { GithubSyncService } from './services/github-sync.service';
import { PullRequestsController } from './controllers/pull-requests.controller';

@Module({
  imports: [
    // Ez mondja meg a TypeORM-nek, hogy "Helló, töltsd be ezt az Entity-t!"
    TypeOrmModule.forFeature([PullRequestEntity])
  ],
  providers: [GithubSyncService],
  controllers: [PullRequestsController], // A Controller-t is regisztrálni kell, hogy a NestJS tudja, hogy létezik
  exports: [TypeOrmModule, GithubSyncService] // Ezt exportáljuk, hogy a jövőbeli Service-ek használhassák
})
export class PullRequestsModule {}