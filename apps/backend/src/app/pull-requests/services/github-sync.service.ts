import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PullRequestEntity } from '../entities/pull-request.enity';
import { Repository } from 'typeorm';
import { GithubApiPullRequest } from '@devsync/shared-types';

@Injectable()
export class GithubSyncService {
  // Beépített NestJS Logger a szép terminál kimenetekért
  private readonly logger = new Logger(GithubSyncService.name);

  // A Dependency Injection (DI) varázslata: 
  // A NestJS automatikusan odaadja nekünk a ConfigService-t a konstruktorban.
  constructor(
    private configService: ConfigService,
    // Így kérjük el a TypeORM-től az Entity-nkhez tartozó Repository-t
    @InjectRepository(PullRequestEntity)
    private readonly prRepository: Repository<PullRequestEntity>,
  ) {}

  /**
   * Lekéri egy adott repó összes Pull Requestjét a GitHub API-ról.
   * @param owner A repó tulajdonosa (pl. 'facebook')
   * @param repo A repó neve (pl. 'react')
   */
  async fetchPullRequests(owner: string, repo: string): Promise<GithubApiPullRequest[]> {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    // A GitHub API végpontja a PR-ek lekérésére (state=all: nyitott és zárt PR-ek is kellenek)
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all`;

    try {
      this.logger.log(`Fetching PRs from: ${owner}/${repo}...`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          // Ha nincs token, undefined lesz, a GitHub pedig token nélkül is kiszolgál (csak alacsonyabb limittel)
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/vnd.github.v3+json', // Kérjük, hogy a standard v3-as JSON formátumot adja
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.log(`Successfully fetched ${data.length} PR(s).`);
      
      return data;
    } catch (error) {
      this.logger.error('Failed to fetch data from GitHub', error);
      throw error;
    }
  }

  async syncPullRequestsToDb(owner: string, repo: string): Promise<void> {
    const rawPrs = await this.fetchPullRequests(owner, repo);

    // === 1. AZ OPTIMÁLIS, NATÍV NODE.JS MEGOLDÁS ===
    for (const rawPr of rawPrs) {
      const openedAtDate = new Date(rawPr.created_at);
      const mergedAtDate = rawPr.merged_at ? new Date(rawPr.merged_at) : null;

      let leadTimeInHours = 0;
      if (mergedAtDate) {
        const diffInMs = mergedAtDate.getTime() - openedAtDate.getTime();
        leadTimeInHours = Math.round(diffInMs / (1000 * 60 * 60)); // ms -> hours
      }

      await this.prRepository.upsert(
        {
          githubPrNumber: rawPr.number,
          author: rawPr.user.login,
          status: rawPr.state === 'open' ? 'OPEN' : 'MERGED',
          openedAt: openedAtDate,
          mergedAt: mergedAtDate,
          leadTime: leadTimeInHours,
        },
        ['githubPrNumber']
      );
    }

    /* === 2. AZ RXJS ALTERNATÍVA (Kikommentelve az utókornak) ===
    const sync$ = from(rawPrs).pipe(
      concatMap(async (rawPr: any) => {
        const openedAtDate = new Date(rawPr.created_at);
        const mergedAtDate = rawPr.merged_at ? new Date(rawPr.merged_at) : null;
        
        let leadTimeInHours = 0;
        if (mergedAtDate) {
          const diffInMs = mergedAtDate.getTime() - openedAtDate.getTime();
          leadTimeInHours = Math.round(diffInMs / (1000 * 60 * 60));
        }

        await this.prRepository.upsert({...}, ['githubPrNumber']);
        return rawPr.number;
      }),
      toArray()
    );
    await lastValueFrom(sync$);
    */

    this.logger.log(`Sikeresen szinkronizáltunk ${rawPrs.length} db PR-t az adatbázisba!`);
  }
}