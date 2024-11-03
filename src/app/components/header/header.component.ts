// src/app/components/header/header.component.ts
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../theme.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isBrowser: boolean; // Flag to check if we are running in the browser
  cartCount$: Observable<number>; // Observable to hold cart count
  username: string | null = null;

  constructor(
    private themeService: ThemeService,
    private cartService: CartService,
    private authService: AuthService, // Inject AuthService for user authentication
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    // Check if we're in the browser
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Always apply the dark theme using the theme service
    this.themeService.applyDarkTheme();

    // Initialize cartCount$ with the observable from CartService
    this.cartCount$ = this.cartService.cartCount$;
  }

    ngOnInit(): void {
    if (this.isBrowser) {
      this.loadUserData();
    }
    
    // Subscribe to username changes
    this.authService.username$.subscribe((username) => {
      this.username = username;
      if (this.username) {
        // Load cart data for the logged-in user
        this.cartService.loadInitialCartData(this.username);
      }
      console.log('Username updated:', this.username);
    });
  }

  private loadUserData(): void {
    if (this.authService.isAuthenticated()) {
      this.username = this.authService.getUsername();
      if (this.username) {
        // Load cart data for the authenticated user
        this.cartService.loadInitialCartData(this.username);
      }
      console.log('User is authenticated. Username:', this.username);
    } else {
      console.log('User is not authenticated.');
    }
  }

  onLogout(): void {
    this.authService.logout();
     this.cartService.triggerEmptyCart();
    this.username = null;
    console.log('User logged out. Cart data cleared.');
  }
}
