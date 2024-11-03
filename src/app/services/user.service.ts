import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usernameSource = new BehaviorSubject<string | null>(null);
  username$ = this.usernameSource.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Check if we are running in the browser environment
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadUsername();  // Only load username if in the browser
    }
  }

  setUsername(username: string) {
    this.usernameSource.next(username);
    if (this.isBrowser) {
      localStorage.setItem('username', username);
    }
  }

  loadUsername() {
    if (this.isBrowser) {
      const username = localStorage.getItem('username');
      if (username) {
        this.usernameSource.next(username);
      }
    }
  }
}
