import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SyncPullRequestsDto } from './sync-pull0requests.dto';

@Controller('sync')
export class GithubSyncController {
  
  // Ezentúl nem a Service-t, hanem a BullMQ Queue-t injektáljuk!
  constructor(
    @InjectQueue('github-sync-queue') private readonly syncQueue: Queue
  ) {}

  @Post('pull-requests')
  // @UseGuards(JwtAuthGuard) // Teszteléshez maradhat kikommentelve
  @HttpCode(HttpStatus.ACCEPTED) // 202 Accepted: "Vettük az adást, a háttérben feldolgozzuk"
  async triggerSync(
    @Body() body: SyncPullRequestsDto
  ) {

    // Munka hozzáadása a sorhoz (SyncJob) + Automatikus Retry (AC 3)
    await this.syncQueue.add(
      'sync-job', // A job neve
      { owner: body.owner, repo: body.repo }, // A Job data (amit a Processor megkap)
      {
        attempts: 3, // Ha elszáll (pl. rate limit), max 3-szor újrapróbálja
        backoff: {
          type: 'exponential', // Exponenciális várakozás: 1. hiba után vár 5mp-t, 2. után 25mp-t, stb.
          delay: 5000,
        },
        removeOnComplete: true, // Ne szemeteljük tele a Redist a kész feladatokkal
      }
    );

    // Azonnali válasz a kliensnek, nem várunk a letöltésre!
    return {
      message: `Szinkronizáció beállítva a háttérben a ${body.owner}/${body.repo} repository-hoz.`,
      status: 'QUEUED',
    };
  }
}