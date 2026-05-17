import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '../../../../shared/Models/iproduct';
import { HomeService } from '../../Services/home-service';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class Home implements OnInit{
  products!:Observable<IProduct[]>
  constructor(private homeService:HomeService){}

  ngOnInit(): void {
    this.products = this.homeService.getProducts();
  }
  
}
