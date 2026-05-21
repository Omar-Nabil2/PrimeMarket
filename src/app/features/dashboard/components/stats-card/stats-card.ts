import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  imports: [NgClass],
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.css',
})
export class StatsCard {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() icon = 'ti-chart-bar';
  @Input() color: 'blue' | 'red' | 'green' | 'orange' = 'blue';
  @Input() sublabel = '';
}