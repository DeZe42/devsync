import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GithubApiPullRequest, GithubPullRequestDetails } from '@devsync/shared-types';
import { PullRequestEntity } from '../../pull-requests/entities/pull-request.entity';
import { AiRiskAnalyzerService } from '../../ai/services/ai-risk-analyzer.service';

@Injectable()
export class GithubSyncService {
  private readonly logger = new Logger(GithubSyncService.name);

  constructor(
    private readonly aiRiskAnalyzer: AiRiskAnalyzerService,
    private configService: ConfigService,
    @InjectRepository(PullRequestEntity)
    private readonly prRepository: Repository<PullRequestEntity>,
  ) {}

  /**
   * Lekéri egy adott repó Pull Requestjeit a GitHub API-ról, lapozással.
   */
  async fetchPullRequests(owner: string, repo: string, page = 1, perPage = 100): Promise<GithubApiPullRequest[]> {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    
    // URL kiegészítése a page és per_page paraméterekkel
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=${perPage}&page=${page}`;

    try {
      this.logger.log(`Fetching PRs from: ${owner}/${repo} (Page: ${page})...`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.log(`Successfully fetched ${data.length} PR(s) on page ${page}.`);
      
      return data;
    } catch (error) {
      this.logger.error('Failed to fetch data from GitHub', error);
      throw error;
    }
  }

  async fetchPullRequestDetails(owner: string, repo: string, pullNumber: number): Promise<GithubPullRequestDetails> {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      return { additions: 0, deletions: 0, changed_files: 0 };
    }

    return await response.json();
  }

  async syncPullRequestsToDb(owner: string, repo: string): Promise<void> {
    let page = 1;
    const perPage = 100; // 100 a maximum amit a GitHub enged
    let hasMore = true;
    let totalSaved = 0;

    this.logger.log(`Szinkronizáció indítása: ${owner}/${repo}`);

    // Ciklus, ami addig fut, amíg a GitHub ad vissza PR-eket
    while (hasMore) {
      const rawPrs = await this.fetchPullRequests(owner, repo, page, perPage);

      // Ha az aktuális oldalon már nincs PR, megszakítjuk a ciklust
      if (rawPrs.length === 0) {
        hasMore = false;
        break;
      }

      for (const rawPr of rawPrs) {
        const openedAtDate = new Date(rawPr.created_at);
        const mergedAtDate = rawPr.merged_at ? new Date(rawPr.merged_at) : null;

        let leadTimeInHours = 0;
        if (mergedAtDate) {
          const diffInMs = mergedAtDate.getTime() - openedAtDate.getTime();
          leadTimeInHours = Math.round(diffInMs / (1000 * 60 * 60));
        }

        let aiRiskScore: number | undefined = undefined;

        // CSAK a nyitott PR-eknél kérjük le a részleteket és számolunk kockázatot
        if (rawPr.state === 'open') {
          const details = await this.fetchPullRequestDetails(owner, repo, rawPr.number);
          const additions = details.additions || 0;
          const deletions = details.deletions || 0;
          const changedFiles = details.changed_files || 0;
          const authorErrorRate = 0.1; // Alapérték

          const rawRisk = this.aiRiskAnalyzer.analyzePrRisk(additions, deletions, changedFiles, authorErrorRate);
          aiRiskScore = Math.round(rawRisk * 100);
        }

        // 3. Kibővítjük a mentést az új mezővel
        await this.prRepository.upsert(
          {
            githubPrNumber: rawPr.number,
            author: rawPr.user.login,
            status: rawPr.state === 'open' ? 'OPEN' : (rawPr.merged_at ? 'MERGED' : 'CLOSED'),
            openedAt: openedAtDate,
            mergedAt: mergedAtDate,
            leadTime: leadTimeInHours,
            aiRiskScore: aiRiskScore,
          },
          ['githubPrNumber']
        );
      }

      totalSaved += rawPrs.length;
      page++; // Lépünk a következő oldalra
    }

    this.logger.log(`Kész! Összesen ${totalSaved} db PR lett szinkronizálva az adatbázisba!`);
  }

  async getAverageLeadTime(): Promise<{ averageLeadTimeHours: number; totalPrsCount: number }> {
    // 1. Lekérjük az összes merge-elt PR-t, aminek van openedAt és mergedAt értéke
    const prs = await this.prRepository.find({
      where: { status: 'MERGED' },
    });

    if (prs.length === 0) {
      return { averageLeadTimeHours: 0, totalPrsCount: 0 };
    }

    let totalLeadTimeMs = 0;
    let validPrsCount = 0;

    for (const pr of prs) {
      if (pr.openedAt && pr.mergedAt) {
        const opened = new Date(pr.openedAt).getTime();
        const merged = new Date(pr.mergedAt).getTime();
        
        // Időkülönbség milliszekundumban
        const diff = merged - opened;
        
        if (diff > 0) {
          totalLeadTimeMs += diff;
          validPrsCount++;
        }
      }
    }

    if (validPrsCount === 0) {
      return { averageLeadTimeHours: 0, totalPrsCount: 0 };
    }

    // Átlag kiszámítása órában
    const averageMs = totalLeadTimeMs / validPrsCount;
    const averageHours = averageMs / (1000 * 60 * 60);

    return {
      averageLeadTimeHours: Math.round(averageHours * 100) / 100, // Két tizedesjegyre kerekítve
      totalPrsCount: validPrsCount,
    };
  }
}