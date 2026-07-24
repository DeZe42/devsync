import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PullRequestEntity } from './entities/pull-request.entity';
import { PullRequestsController } from './controllers/pull-requests.controller';
import { BullModule } from '@nestjs/bullmq';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [
    SyncModule, // <-- Ez a modul importálása, hogy a Service elérhető legyen
    // Ez mondja meg a TypeORM-nek, hogy "Helló, töltsd be ezt az Entity-t!"
    TypeOrmModule.forFeature([PullRequestEntity]),
    BullModule.registerQueue({
      name: 'github-sync-queue',
    }),
  ],
  providers: [],
  controllers: [PullRequestsController], // A Controller-t is regisztrálni kell, hogy a NestJS tudja, hogy létezik
  exports: [TypeOrmModule] // Ezt exportáljuk, hogy a jövőbeli Service-ek használhassák
})
export class PullRequestsModule {}