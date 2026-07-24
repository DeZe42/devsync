import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { PullRequestsModule } from '../pull-requests/pull-requests.module'; // <-- Importáld a modult
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [PullRequestsModule, SyncModule],
  providers: [],                 
  controllers: [MetricsController],
  exports: []             
})
export class MetricsModule {}