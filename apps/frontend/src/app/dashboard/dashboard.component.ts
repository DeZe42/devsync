import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { PullRequestStoreService } from '../services/pull-request-store.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  readonly store = inject(PullRequestStoreService);

  ngOnInit() {
    this.store.loadPullRequests();
  }
}
