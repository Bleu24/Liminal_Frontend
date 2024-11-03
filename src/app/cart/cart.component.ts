import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy  {
  cartItems: any[] = [];
  totalItems: number = 0;
  totalPrice: number = 0;
  private subscriptions: Subscription = new Subscription();
  isBrowser: boolean;

  // Declare the images array with image paths based on productId
  images: { [key: number]: string } = {
    1: '/assets/shirts/1.png',
    2: '/assets/shirts/4.png',
    3: '/assets/shirts/3.png',
    4: '/assets/shirts/2.png',
    5: '/assets/shirts/5.png',
    // Add more productId: imagePath pairs as needed
  };

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const username = this.authService.getUsername() || '';

      // Initiate fetching of cart items
      this.cartService.getCartItems(username).subscribe();

      // Subscribe to cartItems$ to receive updates
      this.subscriptions.add(
        this.cartService.cartItems$.subscribe((items) => {
          this.cartItems = items;
          this.calculateTotals();
        })
      );

      // Subscribe to empty cart event
      this.subscriptions.add(
        this.cartService.emptyCart$.subscribe(() => {
          this.emptyCart();
        })
      );
    }
  }

  

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  loadCartItems(): void {
    let username = '';
    if (this.isBrowser) {
      username = localStorage.getItem('username') || '';
    }
    this.cartService.getCartItems(username).subscribe((items) => {
      this.cartItems = items;
      this.calculateTotals();
    });
  }

  calculateTotals(): void {
    this.totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + (item.pricePerItem * item.quantity), 0);
  }

  increaseQuantity(item: any): void {
    item.quantity++;
    this.cartService.updateCartItem(item).subscribe(() => {
      this.calculateTotals();
    });
  }

  // New method to empty the cart
  emptyCart(): void {
    this.cartService.clearCartForSession();
      this.cartItems = []; // Clear the local cart items
      this.calculateTotals(); // Recalculate totals (which should now be zero)
      console.log("Cart emptied successfully.");
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.cartService.updateCartItem(item).subscribe(() => {
        this.calculateTotals();
      });
    }
  }

  removeFromCart(item: any): void {
    if (this.isBrowser) {
      const username = this.authService.getUsername() || '';
      const productId = item.id  // Use the correct identifier
      this.cartService.removeFromCart(username, productId).subscribe({
        next: () => {
          // The cartItems$ observable will emit the updated items
          // No need to manipulate cartItems directly
          this.loadCartItems();
          this.calculateTotals();
        },
        error: (error) => {
          console.error('Failed to remove item from cart:', error);
        }
      });
    }
  }
  
  
  

  checkout(): void {
    // Implement checkout logic here
    console.log("Proceeding to checkout...");
  }
}
