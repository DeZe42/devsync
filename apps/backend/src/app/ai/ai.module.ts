import { Module } from '@nestjs/common';
import { AiRiskAnalyzerService } from './services/ai-risk-analyzer.service';

@Module({
  imports: [],
  providers: [AiRiskAnalyzerService],
  controllers: [],
  exports: [AiRiskAnalyzerService],
})
export class AiModule {}