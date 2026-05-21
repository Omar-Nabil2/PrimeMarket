import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HomeService } from '../../Services/home-service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ProductCard } from '../../Components/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [CommonModule,ProductCard, AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class Home{
  private homeService = inject(HomeService);
  result$ = this.homeService.result$;
  categoryProducts$ = this.homeService.categoryProducts$;
  selectedCategoryId$ = this.homeService.selectedCategoryId;

  onPageChange(page: number): void {
    this.homeService.setPage(page);
  }
  
}
