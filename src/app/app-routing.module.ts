import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TopsComponent } from './tops/tops.component';
import { LogoSceneComponent } from './components/logo-scene/logo-scene.component';
import { SignupComponent } from './signup/signup.component';
import { CartComponent } from './cart/cart.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';

const routes: Routes = [
  { path: '', component: LogoSceneComponent},
  { path: 'tops', component: TopsComponent },
  { path: 'register', component: SignupComponent},
  { path: 'cart', component: CartComponent},
  { path: 'home', component: LogoSceneComponent},
  { path: 'about', component: AboutComponent},
  { path: 'contact', component: ContactComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
