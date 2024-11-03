// src/app/services/wishlist.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistCountSubject = new BehaviorSubject<number>(0);
  wishlistCount$ = this.wishlistCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Add an item to the wishlist.
   * @param productId - The ID of the product to add to the wishlist.
   * @returns Observable of the HTTP response.
   */
  addToWishlist(productId: string): Observable<any> {
    return this.http.post(`/api/wishlist`, { productId }).pipe(
      map((response: any) => {
        this.updateWishlistCount(this.getCurrentWishlistCount() + 1); // Increment count
        return response;
      }),
      catchError((error) => {
        console.error('Error adding to wishlist:', error);
        throw error;
      })
    );
  }

  /**
   * Remove an item from the wishlist.
   * @param productId - The ID of the product to remove from the wishlist.
   * @returns Observable of the HTTP response.
   */
  removeFromWishlist(productId: string): Observable<any> {
    return this.http.delete(`/api/wishlist/${productId}`).pipe(
      map((response: any) => {
        this.updateWishlistCount(this.getCurrentWishlistCount() - 1); // Decrement count
        return response;
      }),
      catchError((error) => {
        console.error('Error removing from wishlist:', error);
        throw error;
      })
    );
  }

  /**
   * Update the wishlist count.
   * @param count - The new count of wishlist items.
   */
  updateWishlistCount(count: number): void {
    this.wishlistCountSubject.next(count);
  }

  /**
   * Get the current wishlist count.
   * @returns The current count of wishlist items.
   */
  getCurrentWishlistCount(): number {
    return this.wishlistCountSubject.value;
  }
}
