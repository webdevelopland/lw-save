import { NgModule } from '@angular/core';

import {
  LoadingService,
  BranchService,
  EncodingService,
  ParseService,
  StateService,
  BuildService,
  CombineService,
} from './services';
import { SharedModule } from '@/shared';

@NgModule({
  imports: [SharedModule],
  providers: [
    LoadingService,
    BranchService,
    EncodingService,
    ParseService,
    StateService,
    BuildService,
    CombineService,
  ],
})
export class CoreModule {}
