import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AvlInputComponent } from 'src/app/shared/forms/avl-input/avl-input.component';
import { AvlButtonComponent } from 'src/app/shared/buttons/avl-button/avl-button.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, AvlInputComponent, AvlButtonComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {}
