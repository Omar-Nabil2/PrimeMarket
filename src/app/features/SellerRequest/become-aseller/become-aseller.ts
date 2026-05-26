import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IBrandService } from '../../../shared/Services/ibrand-service';
import { ToastService } from '../../../shared/Services/toast-service';
import { Router } from '@angular/router';
import { ILocationData } from '../../../shared/Models/Brands/ilocation-data';
import { StepIndicator } from '../Components/step-indicator/step-indicator';
import { MapLocation } from '../Components/map-location/map-location';
import { LogoUpload } from '../Components/logo-upload/logo-upload';
import { BrandInfo } from '../Components/brand-info/brand-info';

@Component({
  selector: 'app-become-aseller',
  imports: [StepIndicator, MapLocation, LogoUpload,BrandInfo],
  templateUrl: './become-aseller.html',
  styleUrl: './become-aseller.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BecomeASeller {

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.currentStep() > 1) {
      event.preventDefault();
    }
  }

  private fb = inject(FormBuilder);
  private brandService = inject(IBrandService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  currentStep = signal(1);
  isSubmitting = signal(false);
  selectedLogo = signal<File | null>(null);

  brandInfoForm: FormGroup = this.fb.group({
    brandName: ['', Validators.required],
    description: ['']
  });

  nextStep(): void {
    this.currentStep.update(s => s + 1);
  }

  prevStep(): void {
    this.currentStep.update(s => s - 1);
  }

  onLogoSelected(file: File): void {
    this.selectedLogo.set(file);
    this.nextStep();
  }

  showSuccessDialog = signal(false);

 onLocationSelected(location: ILocationData): void {
    this.isSubmitting.set(true);
    const { brandName, description } = this.brandInfoForm.value;

    this.brandService.register({
      brandName,
      description: description || null,
      logo: this.selectedLogo()!,
      street: location.street,
      city: location.city,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showSuccessDialog.set(true);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toastService.error('Registration failed. Please try again.');
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
   
}
