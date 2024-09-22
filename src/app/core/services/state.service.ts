import { Injectable } from '@angular/core';

import { State } from '@/core/type';

@Injectable()
export class StateService {
  stateList: State[] = [];
}
