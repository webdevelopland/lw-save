import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { State } from '@/core/type';
import { LoadingService } from '@/core/services';
import { BranchService, ParseService, BuildService, CombineService } from '@/core/services';

@Component({
  selector: 'page-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  isLoaded: boolean = false;
  state = new State();
  fileSub = new Subscription();
  msg: string;

  constructor(
    private branchService: BranchService,
    private parseService: ParseService,
    private buildService: BuildService,
    private combineService: CombineService,
    public loadingService: LoadingService,
  ) {
    this.loadingService.isLoading = false;
  }

  importFiles(fileList: FileList): void {
    this.loadingService.isLoading = true;
    this.fileSub = this.branchService.getListOfFiles(fileList).subscribe(files => {
      if (files && files.length > 1) {
        this.parseService.parse(files[0].binary);
        this.parseService.parse(files[1].binary);

        this.combineService.combine();

        this.buildService.build(2); // Build combined save

        this.msg = 'Combined save file is generated';
        this.loadingService.isLoading = false;
        this.isLoaded = true;
      } else {
        this.msg = 'You need to upload at least 2 files';
        this.loadingService.isLoading = false;
        this.isLoaded = true;
      }
    });
  }
}
