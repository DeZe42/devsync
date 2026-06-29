import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubSyncService {
  // Beépített NestJS Logger a szép terminál kimenetekért
  private readonly logger = new Logger(GithubSyncService.name);

  // A Dependency Injection (DI) varázslata: 
  // A NestJS automatikusan odaadja nekünk a ConfigService-t a konstruktorban.
  constructor(private configService: ConfigService) {}

  /**
   * Lekéri egy adott repó összes Pull Requestjét a GitHub API-ról.
   * @param owner A repó tulajdonosa (pl. 'facebook')
   * @param repo A repó neve (pl. 'react')
   */
  async fetchPullRequests(owner: string, repo: string): Promise<object[]> {
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
}