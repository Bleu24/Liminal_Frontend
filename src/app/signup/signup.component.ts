import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  signupForm: FormGroup;
  signinForm: FormGroup;
  isSignUpMode = true;
  emailFilled = false;
  usernameFilled = false;
  passwordFilled = false;
  repeatPasswordFilled = false;
  showUsernameSection = false;
  showPasswordSection = false;
  showRepeatPasswordSection = false;
  showSuccessMessage = false;
  showLoggedInMessage = false;
  errormessage = '';

  successMarginTop = -75;
  successLogInMarginTop = -75;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signupForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(8)]],  // Corrected
        repeatPassword: ['', Validators.required],
      },
      { validator: this.passwordsMatch }
    );

     // Initialize Sign-in Form
     this.signinForm = this.fb.group({
      emailOrUsername: ['', Validators.required],  // Email or Username
      password: ['', Validators.required],
    });
  }

  onEmailOrUsernameChange() {
    const value = this.signinForm.get('emailOrUsername')?.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailFilled = !!value && (emailPattern.test(value) || value.length > 0); // Checks if it's a valid email or non-empty username
  }

  passwordsMatch(group: FormGroup) {
    return group.get('password')?.value === group.get('repeatPassword')?.value
      ? null
      : { mismatch: true };
  }

  selectForm(formType: string) {
    this.isSignUpMode = formType === 'signup';
  }

  resetForm() {
    this.signupForm.reset();
    this.signinForm.reset();
    this.emailFilled = false;
    this.usernameFilled = false;
    this.passwordFilled = false;
    this.repeatPasswordFilled = false;
    this.showPasswordSection = false;
    this.showRepeatPasswordSection = false;
    this.showSuccessMessage = false;
    this.showLoggedInMessage = false;
    this.successMarginTop = -75;
    this.successLogInMarginTop = -75;
  }

  

  onEmailChange() {
    this.emailFilled = !!this.signupForm.get('email')?.value || !!this.signinForm.get('email')?.value;
  }

  onUsernameChange() {
    this.usernameFilled = !!this.signupForm.get('username')?.value;
  }
  

  onPasswordChange() {
    this.passwordFilled = !!this.signupForm.get('password')?.value || !!this.signinForm.get('password')?.value;
  }

  onRepeatPasswordChange() {
    this.repeatPasswordFilled = !!this.signupForm.get('repeatPassword')?.value;
  }

  proceedToUsername() {
    if (this.emailFilled) {
      this.showUsernameSection = true;
    }
  }

  proceedToPassword() {
    if (this.emailFilled) {  // Check if both email and username are filled
      this.showPasswordSection = true;
    }
  }

  proceedToRepeatPassword() {
    if (this.passwordFilled) {
      this.showRepeatPasswordSection = true;
    }
  }

  completeSignup(): void {
    if (this.signupForm.invalid) {
      this.errormessage = 'Form is invalid. Please check the inputs.';
      return;
    }

    const { email, username, password, repeatPassword } = this.signupForm.value;

    this.authService.registerUser(email, username, password, repeatPassword).subscribe(
      (response) => {
        // Display success message and animate
        this.showSuccessMessage = true;
        this.successMarginTop = 0;
        console.log('User registered successfully:', response);

        // Redirect to the login page or home page after a brief delay
        setTimeout(() => {
          this.router.navigate(['/about']); // Adjust the route as needed
        }, 1000);
      },
      (error) => {
        console.error('Registration failed:', error);
        this.errormessage = error?.error?.message || 'Registration failed. Please try again.';
      }
    );
  }
  
  completeSignin(): void {
    if (this.signinForm.invalid) {
      this.errormessage = 'Form is invalid. Please check the inputs.';
      return;
    }
  
    const { emailOrUsername, password } = this.signinForm.value;
  
    // Attempt to sign in the user
    this.authService.signInUser(emailOrUsername, password).subscribe(
      (response) => {
        console.log('Token from backend:', response.token); 
        // Check if the response contains the token, username, and expiresIn
        if (response.token && response.username && response.expiresIn) {
          // Calculate the expiration time in seconds
          const currentTime = Date.now();
          const expirationTime = currentTime + response.expiresIn;
  
          // Store the token, username, and expiration time
          this.authService.storeTokenAndUsername(response.token, response.username);
          this.authService.setTokenExpiration(expirationTime);
  
          // Show the login success message
          this.showLoggedInMessage = true;
          this.successLogInMarginTop = 0;
          console.log('User logged in successfully', response);
  
          // Redirect to the home page after a brief delay
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        } else {
          this.errormessage = 'Login successful, but no token received.';
          console.error('No token or expiration received in response:', response);
        }
      },
      (error) => {
        console.error('Login failed', error);
        this.errormessage = 'Login failed. Please check your credentials.';
      }
    );
  }
  
  
}
