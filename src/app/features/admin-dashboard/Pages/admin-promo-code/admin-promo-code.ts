import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PromoCodeService } from '../../../../shared/Services/promo-code-service';
import { IPromoCode, DiscountType } from '../../../../shared/Models/Checkout/ipromo-code';
import { ToastService } from '../../../../shared/Services/toast-service';

@Component({
  selector: 'app-admin-promo-code',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-promo-code.html',
  styleUrl: './admin-promo-code.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPromoCode implements OnInit {
  private promoService = inject(PromoCodeService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  promoCodes = signal<IPromoCode[]>([]);
  loading = signal(false);
  searchTerm = signal('');
  statusFilter = signal<'all' | 'active' | 'expired'>('all');

  showForm = signal(false);
  editingId = signal<number | null>(null);
  formSubmitting = signal(false);

  form!: FormGroup;

  filteredCodes = computed(() => {
    let items = this.promoCodes();

    const search = this.searchTerm().trim().toLowerCase();
    if (search) {
      items = items.filter(p => p.code.toLowerCase().includes(search));
    }

    const filter = this.statusFilter();
    const now = new Date();
    if (filter === 'active') {
      items = items.filter(p => p.isActive && new Date(p.expiresAt) > now);
    } else if (filter === 'expired') {
      items = items.filter(p => new Date(p.expiresAt) <= now);
    }

    return items;
  });

  stats = computed(() => {
    const items = this.promoCodes();
    const total = items.length;
    const active = items.filter(p => p.isActive && new Date(p.expiresAt) > new Date()).length;
    const expired = items.filter(p => new Date(p.expiresAt) <= new Date()).length;
    const totalUsed = items.reduce((sum, p) => sum + (p.usedCount || 0), 0);
    return { total, active, expired, totalUsed };
  });

  discountTypeOptions = [
    { value: 0, label: 'Percentage (%)' },
    { value: 1, label: 'Fixed Amount (EGP)' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadPromoCodes();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      discountType: [0, Validators.required],
      discountValue: ['', [Validators.required, Validators.min(0)]],
      usageLimit: ['', [Validators.required, Validators.min(1)]],
      expiresAt: ['', Validators.required],
      isActive: [true]
    });
  }

  loadPromoCodes(): void {
    this.loading.set(true);
    this.promoService.getAllPromoCodes().subscribe({
      next: res => {
        this.promoCodes.set(res ?? []);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.toast.handleError(err).subscribe();
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  setStatusFilter(filter: 'all' | 'active' | 'expired'): void {
    this.statusFilter.set(filter);
  }

  openForm(promo?: IPromoCode): void {
    if (promo) {
      this.editingId.set(promo.id);
      this.form.patchValue({
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        usageLimit: promo.usageLimit,
        expiresAt: this.formatDateForInput(promo.expiresAt),
        isActive: promo.isActive
      });
    } else {
      this.editingId.set(null);
      this.form.reset({ discountType: 0, isActive: true });
    }
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.reset({ discountType: 0, isActive: true });
  }

  submitForm(): void {
    if (!this.form.valid) {
      this.toast.error('Please fill all required fields correctly');
      return;
    }

    this.formSubmitting.set(true);
    const formValue = this.form.value;
    const request = {
      ...formValue,
      expiresAt: new Date(formValue.expiresAt).toISOString()
    };

    if (this.editingId()) {
      this.promoService.updatePromoCode(this.editingId()!, request).subscribe({
        next: () => {
          this.loadPromoCodes();
          this.closeForm();
          this.toast.success('Promo code updated successfully');
          this.formSubmitting.set(false);
        },
        error: err => {
          this.formSubmitting.set(false);
          this.toast.handleError(err).subscribe();
        }
      });
    } else {
      this.promoService.createPromoCode(request).subscribe({
        next: () => {
          this.loadPromoCodes();
          this.closeForm();
          this.toast.success('Promo code created successfully');
          this.formSubmitting.set(false);
        },
        error: err => {
          this.formSubmitting.set(false);
          this.toast.handleError(err).subscribe();
        }
      });
    }
  }

  deletePromo(id: number): void {
    if (confirm('Are you sure you want to delete this promo code?')) {
      this.promoService.deletePromoCode(id).subscribe({
        next: () => {
          this.loadPromoCodes();
          this.toast.success('Promo code deleted successfully');
        },
        error: err => {
          this.toast.handleError(err).subscribe();
        }
      });
    }
  }

  isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) <= new Date();
  }

  isActive(promo: IPromoCode): boolean {
    return promo.isActive && !this.isExpired(promo.expiresAt);
  }

  getUsagePercentage(promo: IPromoCode): number {
    if (promo.usageLimit === 0) return 0;
    return Math.round(((promo.usedCount || 0) / promo.usageLimit) * 100);
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  getDiscountTypeLabel(type: DiscountType): string {
    return type === 0 ? 'Percentage' : 'Fixed Amount';
  }
}
