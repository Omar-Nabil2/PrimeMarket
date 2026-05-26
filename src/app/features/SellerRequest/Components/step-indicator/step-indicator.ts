import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-step-indicator',
  imports: [],
  templateUrl: './step-indicator.html',
  styleUrl: './step-indicator.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepIndicator {
  currentStep = input.required<number>();
  steps = ['Brand Info', 'Logo Upload', 'Location'];
}
