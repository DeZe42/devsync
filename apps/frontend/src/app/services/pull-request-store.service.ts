import { inject, Injectable, signal } from '@angular/core';
import { PullRequestService } from './pull-request.service';
import { PullRequest } from '@devsync/shared-types';

@Injectable({
  providedIn: 'root',
})
export class PullRequestStoreService {
  private prService = inject(PullRequestService);

  // 1. A WritableSignal, ami magában tartja a PR listát és a betöltési státuszt
  private readonly _pullRequests = signal<PullRequest[]>([]);
  private readonly _loading = signal<boolean>(false);

  // 2. Publikusan olvasható (readonly) signalok a komponensek számára
  readonly pullRequests = this._pullRequests.asReadonly();
  readonly loading = this._loading.asReadonly();

  // 3. Metódus, ami betölti az adatokat a backendről és frissíti a Signalt
  loadPullRequests() {
    this._loading.set(true);
    this.prService.getPullRequests().subscribe({
      next: (response) => {
        const items = response.data || response;
        this._pullRequests.set(items);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Hiba a PR-ek lekérésekor:', err);
        this._loading.set(false);
      },
    });
  }
}
