import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { DashboardService } from '../../../../shared/Services/dashboard-service';
import { CategoryService, ICategory } from '../../../../shared/Services/category-service';


@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, NgClass, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dashboardService = inject(DashboardService);
  private categoryService = inject(CategoryService);
  private cdr = inject(ChangeDetectorRef);

  isEditMode = false;
  productId: number | null = null;
  isLoading = false;
  isSaving = false;
  categories: ICategory[] = [];

  primaryImagePreview: string | null = null;
  primaryImageFile: File | null = null;
  extraImageFiles: File[] = [];
  extraImagePreviews: string[] = [];

  form!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = Number(id);
      this.loadProduct(this.productId);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(0.01)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      categoryIds: [[], Validators.required],
    });
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe(cats => {
      this.categories = cats ?? [];
      this.cdr.markForCheck();
    });
  }

  private loadProduct(id: number): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.dashboardService.getProductById(id).subscribe(product => {
      if (product) {
        this.form.patchValue({
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          stock: product.stock ?? 0,
          categoryIds: product.categories ?? [],
        });

        if (product.thumbnail || product.primaryImageUrl) {
          this.primaryImagePreview = product.thumbnail ?? product.primaryImageUrl;
        }
      }
      this.isLoading = false;
      this.cdr.markForCheck();
    });
  }

  toggleCategory(categoryId: number): void {
    const current: number[] = this.form.get('categoryIds')!.value ?? [];
    const updated = current.includes(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId];
    this.form.get('categoryIds')!.setValue(updated);
  }

  isCategorySelected(categoryId: number): boolean {
    return (this.form.get('categoryIds')!.value ?? []).includes(categoryId);
  }

  onPrimaryImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.primaryImageFile = file;

    const reader = new FileReader();
    reader.onload = e => {
      this.primaryImagePreview = e.target?.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  onExtraImagesChange(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.extraImageFiles = files;
    this.extraImagePreviews = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        this.extraImagePreviews.push(e.target?.result as string);
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    });
  }

  removeExtraImage(index: number): void {
    this.extraImageFiles.splice(index, 1);
    this.extraImagePreviews.splice(index, 1);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.isEditMode && !this.primaryImageFile) {
      alert('Please select a primary image.');
      return;
    }

    this.isSaving = true;
    this.cdr.markForCheck();

    if (this.isEditMode) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  private createProduct(): void {
    const formData = new FormData();
    const v = this.form.value;

    formData.append('Name', v.name);
    formData.append('Description', v.description ?? '');
    formData.append('Price', v.price.toString());
    formData.append('Stock', v.stock.toString());

    (v.categoryIds as number[]).forEach(id =>
      formData.append('CategoryIds', id.toString())
    );

    formData.append('PrimaryImage', this.primaryImageFile!);
    this.extraImageFiles.forEach(f => formData.append('ExtraImages', f));

    this.dashboardService.createProduct(formData).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/dashboard/products']);
      },
      error: () => {
        this.isSaving = false;
        this.cdr.markForCheck();
      },
    });
  }

  private updateProduct(): void {
    const v = this.form.value;
    const body = {
      name: v.name,
      description: v.description ?? '',
      price: v.price,
      categoryIds: v.categoryIds,
    };

    this.dashboardService.updateProduct(this.productId!, body).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/dashboard/products']);
      },
      error: () => {
        this.isSaving = false;
        this.cdr.markForCheck();
      },
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }
}