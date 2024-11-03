import { Injectable, Inject, PLATFORM_ID, Injector } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Import AuthService

@Injectable({
  providedIn: 'root'
})
export class CartService {
 
  private _cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this._cartCount.asObservable();
  private baseUrl = 'http://localhost:8080/api/cart';
  private emptyCartSubject = new Subject<void>();
  emptyCart$ = this.emptyCartSubject.asObservable();
  isBrowser: boolean;

  private cartItems: Map<number, number> = new Map();
  private _cartItems = new BehaviorSubject<any[]>([]);
  public cartItems$ = this._cartItems.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService, // Use Injector for lazy injection
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Load initial cart data for a specific user
  loadInitialCartData(username: string): void {
    if (isPlatformBrowser(this.platformId)) {;
      this.loadCartItemsFromStorage(username);
      this.updateCartCountDisplay();
    } 
  }

  clearCartForSession(): void {
    // Clear cart items and count from session storage or local storage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('cartItems'); // Adjust the key if necessary
      localStorage.removeItem('cartCount');
      this._cartCount.next(0); // Reset the cart count observable
      this.cartItems.clear(); // Clear the cart items set
    }
  }

  // Method to trigger emptying the cart
  triggerEmptyCart() {
    this.emptyCartSubject.next();
  }

  // Add item to cart for a specific user and update cart state
addToCart(username: string, productId: number, quantity: number = 1): Observable<any> {
  // Ensure the cart data is serialized correctly
  const cartData = JSON.stringify({ productId, quantity });

  // Set headers to indicate the content type is JSON
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  return this.http.post(`${this.baseUrl}/add`, cartData, { headers }).pipe(
    tap(() => this.addItemToCart(username, productId, quantity)),
    catchError(this.handleError('addToCart', 'Failed to add product to cart. Please try again later.'))
  );
}

  // Remove item from cart for specific user and update cart state
  removeFromCart(username: string, productId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/remove/${productId}`).pipe(
      tap(() => this.removeItemFromCart(username, productId)),
      catchError(this.handleError('removeFromCart', 'Failed to remove item from cart. Please try again later.'))
    );
  }

  // Fetch all cart items for the current user
// Fetch all cart items for the current user and update local cartItems map
getCartItems(username: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/items`).pipe(
    tap((items) => {
      this.syncCartItems(username, items);
      this._cartItems.next(items); // Emit the items to cartItems$
    }),
    catchError(this.handleError('getCartItems', 'Failed to load cart items. Please try again later.'))
  );
}

// Update _cartItems whenever the cart changes
private syncCartItems(username: string, items: any[]): void {
  this.cartItems.clear();
  items.forEach((item) => {
    this.cartItems.set(item.productId, item.quantity);
  });
  this.persistCartData(username);
  this.updateCartCountDisplay();
  this._cartItems.next(items); // Emit the updated items
}

  // Update an existing cart item
  updateCartItem(item: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update`, item).pipe(
      catchError(this.handleError('updateCartItem', 'Failed to update cart item. Please try again later.'))
    );
  }

  // Private Methods

  /// Load unique product IDs and their quantities from local storage for the specific user
private loadCartItemsFromStorage(username: string): void {
  const savedItems = localStorage.getItem(`cartItems_${username}`);
  this.cartItems = savedItems
    ? new Map<number, number>(JSON.parse(savedItems))
    : new Map<number, number>();
}


  // Add item to the cart and update quantity if necessary
  private addItemToCart(username: string, productId: number, quantity: number): void {
    if (this.isBrowser) {
      if (this.cartItems.has(productId)) {
        // If the product already exists, update the quantity
        const currentQuantity = this.cartItems.get(productId) || 0;
        this.cartItems.set(productId, currentQuantity + quantity);
      } else {
        // If the product is new, add it to the cart
        this.cartItems.set(productId, quantity);
      }
      this.persistCartData(username);
      this.updateCartCountDisplay();
    }
  }

  private removeItemFromCart(username: string, productId: number): void {
    if (this.isBrowser && this.cartItems.has(productId)) {
      this.cartItems.delete(productId);
      this.persistCartData(username);
      this.updateCartCountDisplay();
  
      // Get the current cart items array
      const currentItems = this._cartItems.value;
  
      // Filter out the removed item
      const updatedItems = currentItems.filter(item => item.productId !== productId);
  
      // Emit the updated items
      this._cartItems.next(updatedItems);
    }
  }

    private persistCartData(username: string): void {
      localStorage.setItem(`cartItems_${username}`, JSON.stringify(Array.from(this.cartItems.entries())));
    }

  // Update cart count observable to reflect the total quantity of items
  private updateCartCountDisplay(): void {
    this._cartCount.next(this.cartItems.size);
}
  // Error handler
  private handleError(operation = 'operation', message = 'An error occurred') {
    return (error: any): Observable<never> => {
      console.error(`${operation} error:`, error);
      return throwError(() => new Error(message));
    };
  }
}
