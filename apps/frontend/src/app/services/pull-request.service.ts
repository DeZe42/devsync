import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PullRequest } from '@devsync/shared-types';

@Injectable({
  providedIn: 'root',
})
export class PullRequestService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/pull-requests';

  getPullRequests(): Observable<{ data: PullRequest[], meta: object }> {
    return this.http.get<{ data: PullRequest[], meta: object }>(this.apiUrl);
  }
}
