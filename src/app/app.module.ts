import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  HomeComponent
} from '@/routes';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared';
import { LoadingComponent } from './shared/loading';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoadingComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
