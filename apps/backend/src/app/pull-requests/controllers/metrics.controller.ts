import { Controller, Get } from "@nestjs/common";
import { GithubSyncService } from "../services/github-sync.service";

@Controller('metrics') // Ez lesz az URL alapja: /api/pull-requests
export class MetricsController {

    constructor(
        private readonly pullRequestsService: GithubSyncService,
    ) {}

    // Egy sima GET kérés a /api/metrics/lead-time végpontra
    @Get('lead-time')
    async getLeadTimeMetric() {
        return await this.pullRequestsService.getAverageLeadTime();
    }
}