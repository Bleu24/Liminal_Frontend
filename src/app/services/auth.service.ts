// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:8080/api'; // Your backend API URL
  private readonly TOKEN_KEY = 'authToken';
  private readonly USERNAME_KEY = 'username';
  private readonly EXPIRATION_KEY = 'tokenExpiration';
  private usernameSubject = new BehaviorSubject<string | null>(this.getUsername());
  username$ = this.usernameSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Register a new user
  registerUser(email: string, username: string, password: string, repeatPassword: string): Observable<any> {
    const registrationData = { email, username, password, retypedPassword: repeatPassword };
    return this.http.post<any>(`${this.baseUrl}/auth/signup`, registrationData);
  }

  signInUser(emailOrUsername: string, password: string): Observable<any> {
    const signInData = { emailOrUsername, password };
    return this.http.post<any>(`${this.baseUrl}/auth/login`, signInData);
  }

  // Store the token expiration time in milliseconds
  setTokenExpiration(expirationTime: number): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.EXPIRATION_KEY, expirationTime.toString());
    }
  }

  // Store token and username in local storage
  public storeTokenAndUsername(token: string, username: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USERNAME_KEY, username);
      this.usernameSubject.next(username);
    }
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (token) {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload && payload.exp > currentTime;
    }
    return false;
  }

  // Get the token from local storage
  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  // Get the username from local storage
  getUsername(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.USERNAME_KEY) : null;
  }

  // Logout the user
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    this.usernameSubject.next(null);
  }

  // Decode the JWT token to extract the payload
  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }

  // Utility method to check if `localStorage` is available
  public isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
