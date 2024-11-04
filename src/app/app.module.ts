import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { LogoSceneComponent } from './components/logo-scene/logo-scene.component';
import { LucideAngularModule, CircleUser, ShoppingBag  } from 'lucide-angular';
import { TopsComponent } from './tops/tops.component';
import { register } from 'swiper/element/bundle';
import { SignupComponent } from './signup/signup.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatBadgeModule } from '@angular/material/badge';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { CartComponent } from './cart/cart.component';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { AuthService } from './services/auth.service';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { FormsModule } from '@angular/forms'; // Import FormsModule


register();

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LogoSceneComponent,
    TopsComponent,
    SignupComponent,
    CartComponent,
    AboutComponent,
    ContactComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LucideAngularModule.pick({ CircleUser, ShoppingBag }),
    MatBadgeModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    FormsModule 
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor]),
    ),
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
