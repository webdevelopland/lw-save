import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const MaterialImports = [
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatInputModule,
  MatDialogModule,
  MatSlideToggleModule,
  MatTooltipModule,
  MatSnackBarModule,
];

@NgModule({
  imports: MaterialImports,
  exports: MaterialImports,
})
export class MaterialModule {}
