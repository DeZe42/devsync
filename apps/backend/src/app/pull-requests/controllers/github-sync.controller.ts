import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { GithubSyncService } from '../services/github-sync.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

// A @Controller dekorátor adja meg az alap útvonalat
@Controller('sync')
export class GithubSyncController {
  
  // Injektáljuk a Service-ünket
  constructor(private readonly githubSyncService: GithubSyncService) {}

  // A @Post dekorátor mondja meg, hogy ez egy HTTP POST kérés lesz a '/sync/pull-requests' végpontra
  @Post('pull-requests')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK) // Mivel nem új erőforrást hozunk létre (ami 201 Created lenne), egy sima 200 OK jobb választás
  async triggerSync(
    // A @Body() segítségével várjuk, hogy a kérésben küldjék el, melyik repót akarják szinkronizálni
    @Body('owner') owner: string,
    @Body('repo') repo: string,
  ) {
    // Alapértelmezett értékek, ha nem küldenek semmit (a tesztelés kedvéért)
    const targetOwner = owner || 'facebook';
    const targetRepo = repo || 'react';

    // Elindítjuk a Service logikáját
    await this.githubSyncService.syncPullRequestsToDb(targetOwner, targetRepo);

    // Visszaküldünk egy válaszüzenetet a hívónak
    return {
      message: `Szinkronizáció befejezve a ${targetOwner}/${targetRepo} repository-hoz.`,
    };
  }
}