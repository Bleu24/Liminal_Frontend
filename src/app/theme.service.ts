import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkThemeClass = 'dark-theme';

  constructor() {
    this.applyDarkTheme();
  }

  // Apply dark theme permanently
  applyDarkTheme() {
    if (this.isBrowser()) {
      document.body.classList.add(this.darkThemeClass);
    }
  }

  // Check if the code is running in the browser
  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
