import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IProductReview } from '../../../../shared/Models/Product/iproduct-review';
import { DatePipe, NgClass } from '@angular/common';

type TabType = 'description' | 'reviews';

@Component({
  selector: 'app-product-tabs',
  imports: [NgClass, DatePipe],
  templateUrl: './product-tabs.html',
  styleUrl: './product-tabs.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ProductTabs {
  @Input() description!: string;
  @Input() reviews!: IProductReview[];

  activeTab: TabType = 'description';

  setTab(tab: TabType): void {
    this.activeTab = tab;
  }
  get stars(): number[] {
    return Array(5).fill(0);
  }
}
