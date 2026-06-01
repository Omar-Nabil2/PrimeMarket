import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { filter } from 'rxjs';
import { HeroComponent } from "../../../features/app-hero/app-hero";

@Component({
  selector: 'app-mainlayout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Navbar, Footer],
  templateUrl: './mainlayout.html',
  styleUrl: './mainlayout.css',
})
export class Mainlayout implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  breadcrumb = 'Home';

  breadcrumbTrail: { label: string; path: string }[] = [];

ngOnInit(): void {
  this.router.events
    .pipe(filter(e => e instanceof NavigationEnd))
    .subscribe(() => {
      let route = this.activatedRoute.firstChild;
      while (route?.firstChild) route = route.firstChild;
      const current = route?.snapshot.data?.['breadcrumb'];
      const path = route?.snapshot.pathFromRoot
        .map(r => r.url.map(u => u.path).join('/'))
        .filter(Boolean)
        .join('/');

      if (!current || current === 'Home') {
        this.breadcrumbTrail = [];
      } else {
        const index = this.breadcrumbTrail.findIndex(c => c.label === current);
        if (index === -1) {
          this.breadcrumbTrail.push({ label: current, path: '/' + path });
        } else {
          this.breadcrumbTrail = this.breadcrumbTrail.slice(0, index + 1);
        }
      }
    });
}
}
