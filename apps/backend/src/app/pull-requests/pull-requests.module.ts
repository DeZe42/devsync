import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PullRequestEntity } from './entities/pull-request.enity';

@Module({
  imports: [
    // Ez mondja meg a TypeORM-nek, hogy "Helló, töltsd be ezt az Entity-t!"
    TypeOrmModule.forFeature([PullRequestEntity])
  ],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule] // Ezt exportáljuk, hogy a jövőbeli Service-ek használhassák
})
export class PullRequestsModule {}