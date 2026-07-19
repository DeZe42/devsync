import { Controller, Get, UseGuards } from '@nestjs/common';
import { GithubSyncService } from '../services/github-sync.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PullRequestEntity } from '../entities/pull-request.enity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('pull-requests') // Ez lesz az URL alapja: /api/pull-requests
export class PullRequestsController {
  
  // Szintén Dependency Injection: A NestJS automatikusan átadja a Controllernek a Service-t
  constructor(
    private readonly githubSyncService: GithubSyncService,
    @InjectRepository(PullRequestEntity)
    private readonly prRepository: Repository<PullRequestEntity>,
  ) {}

  // Ez a dekorátor mondja meg, hogy ez egy GET végpont lesz.
  // A végleges URL: GET /api/pull-requests/test-sync
  @Get('test-sync')
  @UseGuards(JwtAuthGuard) // <-- EZ A LAKAT! Innentől ide token nélkül nem lehet bejönni.
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

  // Egy sima GET kérés a /api/pull-requests végpontra
  @Get()
  async getAllPrs() {
    // Lekérjük az összes PR-t az adatbázisból, a legújabbakkal kezdve
    const prs = await this.prRepository.find({
      order: {
        openedAt: 'DESC', 
      },
    });

    return {
      count: prs.length,
      data: prs,
    };
  }
}