import { Controller, Get } from '@nestjs/common';
import { GithubSyncService } from '../services/github-sync.service';

@Controller('pull-requests') // Ez lesz az URL alapja: /api/pull-requests
export class PullRequestsController {
  
  // Szintén Dependency Injection: A NestJS automatikusan átadja a Controllernek a Service-t
  constructor(private readonly githubSyncService: GithubSyncService) {}

  // Ez a dekorátor mondja meg, hogy ez egy GET végpont lesz.
  // A végleges URL: GET /api/pull-requests/test-sync
  @Get('test-sync')
  async testSync() {
    // Egyelőre "hardkódolunk" egy publikus repót a teszteléshez.
    // Használhatjuk mondjuk az Angular vagy a NestJS hivatalos repóját, vagy a tiédet!
    const owner = 'nestjs'; 
    const repo = 'nest';    

    // Megkérjük a munkást, hogy hozza el az adatokat...
    const data = await this.githubSyncService.fetchPullRequests(owner, repo);
    
    // ...és egyszerűen visszaküldjük a hívónak (a böngészőnek).
    return data; 
  }
}