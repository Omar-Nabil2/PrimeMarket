import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-brand-info',
  imports: [ReactiveFormsModule],
  templateUrl: './brand-info.html',
  styleUrl: './brand-info.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandInfo {
  form = input.required<FormGroup>();
  next = output<void>();
}
