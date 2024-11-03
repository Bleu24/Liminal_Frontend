import { Component, AfterViewInit, Inject, PLATFORM_ID, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import Swiper from 'swiper';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-tops',
  templateUrl: './tops.component.html',
  styleUrls: ['./tops.component.scss']
})
export class TopsComponent implements AfterViewInit {
  swiper: Swiper | undefined;
  products: any[] = [];
  quantity: number = 1;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cartService: CartService,
    private productService: ProductService,
  ) {}

  ngAfterViewInit(): void {
    // Check if the platform is a browser (not server)
    if (isPlatformBrowser(this.platformId)) {
      // Initialize Swiper instance only in the browser
      this.swiper = new Swiper('.product-slider', {
        spaceBetween: 30,
        effect: 'fade',
        loop: false,
        navigation: {
          nextEl: '.next',
          prevEl: '.prev'
        },
        on: {
          init: () => {
            console.log('Swiper initialized');
            this.updateImageOnSlideChange(); // Ensure the first image is active on init
          }
        }
      });

      // Event listener for slide change
      this.swiper.on('slideChange', () => {
        this.updateImageOnSlideChange(); // Safely access swiper after it's initialized
      });

      this.productService.getProducts().subscribe((data) => {
        this.products = data; // Assign the fetched product data to the products array
      });

    }
 }

  private updateImageOnSlideChange(): void {
    if (!this.swiper) return; // Safeguard if swiper is not initialized

    const index = this.swiper.activeIndex; // Get the active slide index
    const items = document.querySelectorAll('.product-slider__item');
    const images = document.querySelectorAll('.product-img__item');

    if (items[index]) {
      const target = items[index].getAttribute('data-target');

      // Remove the 'active' class from all product images
      images.forEach((img) => {
        img.classList.remove('active');
      });

      // Add the 'active' class to the target image
      const targetImg = document.querySelector(`.product-img__item#${target}`);
      if (targetImg) {
        targetImg.classList.add('active');
      }
    }

    // Handle navigation button states
    this.updateNavigationButtons();
  }

  private updateNavigationButtons(): void {
    if (!this.swiper) return; // Safeguard if swiper is not initialized

    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');

    // Disable or enable buttons based on swiper's position
    if (this.swiper.isEnd && nextButton) {
      nextButton.classList.add('disabled');
    } else if (nextButton) {
      nextButton.classList.remove('disabled');
    }

    if (this.swiper.isBeginning && prevButton) {
      prevButton.classList.add('disabled');
    } else if (prevButton) {
      prevButton.classList.remove('disabled');
    }
  }

  addToCart(productId: number): void {
    const username = localStorage.getItem('username') || '';  // Retrieve userId from localStorage or other sources
    this.cartService.addToCart(username, productId, this.quantity).subscribe(() => {
      console.log("Product added to cart");
    });
  }
  
  
}
