import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { PullRequestStoreService } from '../services/pull-request-store.service';
import { LineChartComponent } from '../components/line-chart.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LineChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  readonly store = inject(PullRequestStoreService);
  readonly chartLabels = computed(() => 
    this.store.pullRequests().map(pr => `#${pr.githubPrNumber}`)
  );
  readonly chartDataValues = computed(() => 
    this.store.pullRequests().map(pr => pr.aiRiskScore || 0)
  );

  ngOnInit() {
    this.store.loadPullRequests();
  }
}
