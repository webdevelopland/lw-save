import { NgModule } from '@angular/core';

import {
  LoadingService
} from './services';
import { SharedModule } from '@/shared';

@NgModule({
  imports: [SharedModule],
  providers: [
    LoadingService
  ],
})
export class CoreModule {}
