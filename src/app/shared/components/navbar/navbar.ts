import { CommonModule } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { AuthService } from '../../services/auth.service';
import { AuthResponse } from '../../Models/auth.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  isAuthenticated = false;
  currentUser: AuthResponse | null = null;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    // Use effect to reactively update the component when auth state changes
    effect(() => {
      const state = this.authService.authState();
      this.isAuthenticated = state.isAuthenticated;
      this.currentUser = state.user;
    });
  }

  ngOnInit(): void {
    // Initialization logic if needed
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getFullName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return '';
  }
}
