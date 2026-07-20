import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { GithubSyncService } from '../services/github-sync.service';

// Ez mondja meg, hogy melyik sort figyelje
@Processor('github-sync-queue')
export class GithubSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(GithubSyncProcessor.name);

  constructor(private readonly githubSyncService: GithubSyncService) {
    super();
  }

  // Ez a metódus fut le automatikusan, ha munka érkezik a sorba
  async process(job: Job<{ owner: string; repo: string }>): Promise<void> {
    this.logger.log(`Worker elindult! Job ID: ${job.id}. Célpont: ${job.data.owner}/${job.data.repo}`);
    
    try {
      // Itt indítjuk el a DEV-201-es logikát
      await this.githubSyncService.syncPullRequestsToDb(job.data.owner, job.data.repo);
      this.logger.log(`Job ${job.id} sikeresen befejeződött.`);
    } catch (error) {
      this.logger.error(`Hiba a Job ${job.id} futása közben:`, error);
      // A hiba eldobása fontos, mert a BullMQ ebből tudja, hogy újra kell próbálkoznia!
      throw error;
    }
  }
}