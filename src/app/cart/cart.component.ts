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
  totalOrderedPrice: number = 0;

  orderedItems: any[] = []; // Array to hold ordered items
  isModalOpen: boolean = false; // Control modal visibility

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

   // Method to close the modal
   closeModal(): void {
    this.isModalOpen = false;
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
  
  removeOrder(): void {
    // Filter the selected items
    const selectedItems = this.cartItems.filter(item => item.selected);
  
    if (selectedItems.length > 0) {
      selectedItems.forEach(item => {
        const username = localStorage.getItem('username') || '';
        this.cartService.removeFromOrder(username, item.productId).subscribe(() => {
          console.log(`Order for product ${item.name} removed`);
          // Optionally, update the cart items or handle UI updates
          item.selected = false; // Unselect the item
        });
      });
    } else {
      alert('No items selected to remove from order.');
    }
  }
  
  
  checkout(): void {
    // Implement checkout logic here
    console.log("Proceeding to checkout...");
  }


  orderSelectedItems(): void {
    const username = localStorage.getItem('username') || ''; // Retrieve username or userId
  
    // Filter selected items based on the 'selected' property and create a snapshot for modal display
    const selectedItems = this.cartItems.filter(item => item.selected);
    this.orderedItems = JSON.parse(JSON.stringify(selectedItems)); // Create a deep copy to retain original values
  
    if (selectedItems.length > 0) {
      selectedItems.forEach(item => {
        this.cartService.addToOrder(username, item.productId, item.quantity).subscribe({
          next: () => {
            console.log(`Product ${item.name} added to order`);
            this.updateQuantityCount(item); // Update the quantity and/or label the item as ordered
  
            // Remove items from the cart now that they have been ordered
            this.removeFromCart(item);
          },
          complete: () => {
            // Once all items have been processed, open the modal
            this.calculateTotalOrderedPrice(); // Recalculate total price for ordered items
            this.isModalOpen = true;
          },
          error: (error) => {
            console.error(`Failed to add product ${item.name} to order`, error);
          }
        });
      });
    } else {
      alert('No items selected for order.');
    }
  }
  

// Method to calculate the total price of ordered items
calculateTotalOrderedPrice(): void {
  this.totalOrderedPrice = this.orderedItems.reduce((sum, item) => sum + (item.pricePerItem * item.quantity), 0);
}

updateQuantityCount(item: any): void {
  // Check if the item quantity has reached 0, and if so, mark it as ordered
  if (item.quantity > 1) {
    item.quantity--; // Decrease the quantity
  } else {
    // If the quantity is 1 and it is being ordered, label it as "Ordered"
    item.quantity = 0;
    item.label = 'Ordered'; // Add a label or property to indicate it is fully ordered
  }
}


  isAnyItemSelected(): boolean {
    return this.cartItems.some(item => item.selected);
  }

}
