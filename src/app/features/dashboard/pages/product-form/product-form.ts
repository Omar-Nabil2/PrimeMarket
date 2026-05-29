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
import { ProductService } from '../../../../shared/Services/product-service';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { CategoryService } from '../../../../shared/Services/category-service';
import { ToastService } from '../../../../shared/Services/toast-service';
import { ICategory } from '../../../../shared/Models/Category/icategory';

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
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  isEditMode = false;
  productId: number | null = null;
  isLoading = false;
  isSaving = false;
  categories: ICategory[] = [];

  existingImages: Array<{ id: number | null; url: string; isPrimary: boolean; isProcessing?: boolean }> = [];
  initialPrimaryImageId: number | null = null;
  desiredPrimaryImageId: number | null = null;
  primarySelectionChanged = false;

  primaryImagePreview: string | null = null;
  primaryImageFile: File | null = null;
  extraImageFiles: File[] = [];
  extraImagePreviews: string[] = [];
  isUploadingImages = false;
  uploadingPrimary = false;
  uploadingExtras: boolean[] = [];
  modalImageUrl: string | null = null;

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
      brandName: ['', [Validators.required, Validators.minLength(2)]],
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

    this.productService.getProductById(id).subscribe(product => {
      if (product) {
        const rawCats = product.categories ?? [];
        const mappedCategoryIds: number[] = [];

        for (const c of rawCats) {
          if (typeof c === 'number') {
            mappedCategoryIds.push(c);
          } else if (typeof c === 'string') {
            const found = this.categories.find(cat => cat.name === c || cat.slug === c);
            if (found) mappedCategoryIds.push(found.id);
          } else if (c && typeof c === 'object' && 'id' in c) {
            const idVal = (c as any).id;
            if (typeof idVal === 'number') mappedCategoryIds.push(idVal);
          }
        }

        if (mappedCategoryIds.length === 0 && rawCats.some((x: any) => typeof x === 'string') && this.categories.length === 0) {
          this.categoryService.getAll().subscribe(cats => {
            this.categories = cats ?? [];
            const remapped: number[] = [];
            for (const c of rawCats) {
              if (typeof c === 'number') remapped.push(c);
              else if (typeof c === 'string') {
                const found = this.categories.find(cat => cat.name === c || cat.slug === c);
                if (found) remapped.push(found.id);
              } else if (c && typeof c === 'object' && 'id' in c) {
                const idVal = (c as any).id;
                if (typeof idVal === 'number') mappedCategoryIds.push(idVal);
              }
            }
            this.form.patchValue({ categoryIds: remapped });
            this.cdr.markForCheck();
          });
        }

        this.form.patchValue({
          name: product.name,
          brandName: product.brandName ?? '',
          description: product.description ?? '',
          price: product.price,
          stock: product.stock ?? 0,
          categoryIds: mappedCategoryIds,
        });

        if (product.thumbnail || product.primaryImageUrl) {
          this.primaryImagePreview = product.thumbnail ?? product.primaryImageUrl;
        }

        this.existingImages = [];
        const rawImgs = product.images ?? product.imageDtos ?? product.imageUrls ?? [];
        for (const img of rawImgs) {
          if (!img) continue;
          if (typeof img === 'string') {
            this.existingImages.push({ id: null, url: img, isPrimary: img === (product.primaryImageUrl ?? product.thumbnail), isProcessing: false });
          } else if (img && typeof img === 'object') {
            const id = (img as any).id ?? (img as any).imageId ?? null;
            const url = (img as any).url ?? (img as any).imageUrl ?? (img as any).path ?? null;
            const isPrimary = !!((img as any).isPrimary) || url === (product.primaryImageUrl ?? product.thumbnail);
            if (url) this.existingImages.push({ id, url, isPrimary, isProcessing: false });
          }
        }

        const initial = this.existingImages.find(i => i.isPrimary && i.id != null);
        this.initialPrimaryImageId = initial ? (initial.id as number) : null;
        this.desiredPrimaryImageId = this.initialPrimaryImageId;
        this.primarySelectionChanged = false;
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
    this.uploadingExtras = files.map(() => false);

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

  openImageModal(url: string): void {
    this.modalImageUrl = url;
    this.cdr.markForCheck();
  }

  closeImageModal(): void {
    this.modalImageUrl = null;
    this.cdr.markForCheck();
  }

  uploadExtraAndSetPrimary(index: number): void {
    if (!this.isEditMode) {
      this.toast.info('Save product first to upload images.');
      return;
    }

    const file = this.extraImageFiles[index];
    const preview = this.extraImagePreviews[index];
    if (!file) return;

    this.extraImageFiles.splice(index, 1);
    this.extraImagePreviews.splice(index, 1);
    this.primaryImageFile = file;
    this.primaryImagePreview = preview;
    this.desiredPrimaryImageId = null;
    this.primarySelectionChanged = true;
    this.cdr.markForCheck();
  }

  uploadPrimaryFileAndSetPrimary(): void {
    if (!this.isEditMode) {
      this.toast.info('Save product first to upload images.');
      return;
    }
    if (!this.primaryImageFile) return;

    this.desiredPrimaryImageId = null;
    this.primarySelectionChanged = true;
    this.cdr.markForCheck();
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
    formData.append('BrandName', v.brandName);
    formData.append('Description', v.description ?? '');
    formData.append('Price', v.price.toString());
    formData.append('Stock', v.stock.toString());

    (v.categoryIds as number[]).forEach(id =>
      formData.append('CategoryIds', id.toString())
    );

    formData.append('PrimaryImage', this.primaryImageFile!);
    this.extraImageFiles.forEach(f => formData.append('ExtraImages', f));

    this.productService.createProduct(formData).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/seller-dashboard/products']);
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
      brandName: v.brandName,
      description: v.description ?? '',
      price: v.price,
      categoryIds: v.categoryIds,
    };

    this.productService.updateProduct(this.productId!, body).subscribe({
      next: () => {
        this.handleImageUploads().subscribe({
          next: () => {
            this.isSaving = false;
            this.router.navigate(['/seller-dashboard/products']);
          },
          error: () => {
            this.isSaving = false;
            this.router.navigate(['/seller-dashboard/products']);
          },
        });
      },
      error: (err: any) => {
        this.isSaving = false;

        const validation = err?.error?.errors || err?.error?.Errors || null;
        if (validation && typeof validation === 'object') {
          Object.keys(validation).forEach(key => {
            const messages = validation[key] as string[];
            const controlName = key.charAt(0).toLowerCase() + key.slice(1);
            const control = this.form.get(controlName);
            if (control) {
              control.setErrors({ server: messages.join(' ') });
              control.markAsTouched();
            }
          });
        }

        this.cdr.markForCheck();
      },
    });
  }

  private handleImageUploads() {
    if (!this.isEditMode) return of(null as any);

    const uploads: Array<any> = [];
    this.isUploadingImages = true;

    if (this.primaryImageFile) {
      this.uploadingPrimary = true;
      const primary$ = this.productService.addImage(this.productId!, this.primaryImageFile, { silent: true }).pipe(
        switchMap((res: any) => {
          const imageId = res?.id ?? res?.imageId ?? res?.value?.id ?? null;
          if (imageId) return this.productService.setPrimaryImage(this.productId!, imageId, { silent: true });
          return of(null);
        }),
        catchError(err => of(null)),
        finalize(() => {
          this.uploadingPrimary = false;
          this.cdr.markForCheck();
        })
      );
      uploads.push(primary$);
    }

    if (this.extraImageFiles.length > 0) {
      const extraUploads = this.extraImageFiles.map((f, idx) =>
        this.productService.addImage(this.productId!, f, { silent: true }).pipe(
          catchError(err => of(null)),
          finalize(() => {
            this.uploadingExtras[idx] = false;
            this.cdr.markForCheck();
          })
        )
      );
      this.uploadingExtras = this.extraImageFiles.map(() => true);
      uploads.push(forkJoin(extraUploads));
    }
    if (this.primarySelectionChanged && this.desiredPrimaryImageId != null && this.desiredPrimaryImageId !== this.initialPrimaryImageId) {
      uploads.push(this.productService.setPrimaryImage(this.productId!, this.desiredPrimaryImageId, { silent: true }).pipe(catchError(err => of(null))));
    }

    if (uploads.length === 0) {
      this.isUploadingImages = false;
      return of(null as any);
    }

    return forkJoin(uploads as any[]).pipe(
      catchError(err => of(null)),
      finalize(() => {
        this.isUploadingImages = false;
        this.uploadingExtras = [];
        this.uploadingPrimary = false;
        this.initialPrimaryImageId = this.desiredPrimaryImageId ?? this.initialPrimaryImageId;
        this.primarySelectionChanged = false;
        this.cdr.markForCheck();
      })
    );
  }

  deleteConfirmTarget: { id: number | null; url: string; isPrimary: boolean; isProcessing?: boolean } | null = null;
  showDeleteConfirm = false;

  requestSetPrimary(image: { id: number | null; url: string; isPrimary: boolean; isProcessing?: boolean }): void {
    this.selectPrimaryLocally(image);
  }

  selectPrimaryLocally(image: { id: number | null; url: string; isPrimary: boolean; isProcessing?: boolean }): void {
    this.existingImages.forEach(i => i.isPrimary = (i === image));
    this.primaryImagePreview = image.url;
    this.desiredPrimaryImageId = image.id ?? null;
    this.primarySelectionChanged = this.desiredPrimaryImageId !== this.initialPrimaryImageId;
    this.cdr.markForCheck();
  }

  confirmDeleteExisting(image: { id: number | null; url: string; isPrimary: boolean; isProcessing?: boolean }): void {
    this.deleteConfirmTarget = image;
    this.showDeleteConfirm = true;
    this.cdr.markForCheck();
  }

  cancelDelete(): void {
    this.deleteConfirmTarget = null;
    this.showDeleteConfirm = false;
    this.cdr.markForCheck();
  }

  deleteExistingImageConfirmed(): void {
    const image = this.deleteConfirmTarget;
    if (!image) return;
    this.showDeleteConfirm = false;
    if (!this.productId || !image.id) {
      this.existingImages = this.existingImages.filter(i => i.url !== image.url);
      this.deleteConfirmTarget = null;
      this.cdr.markForCheck();
      return;
    }

    if (image.isProcessing) return;
    image.isProcessing = true;
    this.cdr.markForCheck();

    this.productService.deleteImage(this.productId, image.id, { silent: true }).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(i => i.id !== image.id);
        if (image.isPrimary) this.primaryImagePreview = null;
        this.deleteConfirmTarget = null;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        image.isProcessing = false;
        const errorMessage = err?.error?.message || 'Not Allow To Delete The Primary Image For The Product';
        this.toast.error(errorMessage);
        this.deleteConfirmTarget = null;
        this.cdr.markForCheck();
      }
    });
  }

  deleteExistingImage(image: { id: number | null; url: string; isPrimary: boolean; isProcessing?: boolean }): void {
    if (!this.productId || !image.id) {
      this.existingImages = this.existingImages.filter(i => i.url !== image.url);
      this.cdr.markForCheck();
      return;
    }

    const confirmDel = window.confirm('Delete this image?');
    if (!confirmDel) return;

    this.productService.deleteImage(this.productId, image.id, { silent: true }).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(i => i.id !== image.id);
        if (image.isPrimary) this.primaryImagePreview = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      },
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }
}