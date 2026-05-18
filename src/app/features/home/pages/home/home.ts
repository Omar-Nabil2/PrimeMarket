import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HomeService } from '../../Services/home-service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ProductCard } from '../../Components/product-card/product-card';
import { IProcuctCard } from '../../../../shared/Models/iprocuct-card';

@Component({
  selector: 'app-home',
  imports: [CommonModule,ProductCard, AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class Home implements OnInit{
  products$!: Observable<IProcuctCard[]>;
  constructor(private homeService:HomeService){}
  
  ngOnInit(): void {
    this.products$ = this.homeService.getProducts();
  }
  
}
