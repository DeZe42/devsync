import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { GithubSyncService } from '../services/github-sync.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PullRequestEntity } from '../entities/pull-request.enity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from './pagination-query.dto';

@Controller('pull-requests') // Ez lesz az URL alapja: /api/pull-requests
export class PullRequestsController {
  
  // Szintén Dependency Injection: A NestJS automatikusan átadja a Controllernek a Service-t
  constructor(
    private readonly githubSyncService: GithubSyncService,
    private readonly pullRequestsService: GithubSyncService,
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
  async getAllPrs(@Query() query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    
    // Kiszámoljuk, hány elemet kell átugrani
    // Pl. a 2. oldalnál, 10-es limitnél: (2 - 1) * 10 = 10 elemet ugrik át
    const skip = (page - 1) * limit; 

    // A findAndCount visszaad egy tömböt: [az adatok, az összes elem száma]
    const [prs, total] = await this.prRepository.findAndCount({
      order: { openedAt: 'DESC' },
      skip: skip,
      take: limit, // A TypeORM így hívja a limitet
    });

    // Visszaadjuk a frontendnek a paginációs metaadatokkal együtt
    return {
      data: prs,
      meta: {
        totalItems: total,
        itemCount: prs.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }  
}