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
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { CategoryService, ICategory } from '../../../../shared/Services/category-service';
import { ToastService } from '../../../../shared/Services/toast-service';


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
  // upload state
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
        // Ensure categoryIds is an array of numeric IDs. The product's
        // categories payload may contain names, ids, or objects depending
        // on the API shape; map them to IDs using the loaded categories.
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

        // If categories weren't loaded yet and we couldn't map by name/slug,
        // fetch categories and remap once available.
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
                if (typeof idVal === 'number') remapped.push(idVal);
              }
            }
            this.form.patchValue({ categoryIds: remapped });
            this.cdr.markForCheck();
          });
        }

        this.form.patchValue({
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          stock: product.stock ?? 0,
          categoryIds: mappedCategoryIds,
        });

        if (product.thumbnail || product.primaryImageUrl) {
          this.primaryImagePreview = product.thumbnail ?? product.primaryImageUrl;
        }

        // Parse existing images if provided by API. Support multiple possible shapes.
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

        // Capture initial primary id so we can decide whether set-primary must be called on save
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

  // Upload an extra image immediately and set it as primary (edit mode only)
  uploadExtraAndSetPrimary(index: number): void {
    // Instead of uploading immediately, mark this extra file as the primary selection.
    // It will be uploaded and set as primary when the user presses "Save".
    if (!this.isEditMode) {
      this.toast.info('Save product first to upload images.');
      return;
    }

    const file = this.extraImageFiles[index];
    const preview = this.extraImagePreviews[index];
    if (!file) return;

    // Move selected extra into the primary slot so it will be uploaded on save
    this.extraImageFiles.splice(index, 1);
    this.extraImagePreviews.splice(index, 1);
    this.primaryImageFile = file;
    this.primaryImagePreview = preview;
    // Indicate primary selection will change on save
    this.desiredPrimaryImageId = null;
    this.primarySelectionChanged = true;
    this.cdr.markForCheck();
  }

  // Upload the currently selected primary file (from file chooser) immediately and set primary
  uploadPrimaryFileAndSetPrimary(): void {
    // Mark the selected primary file to be uploaded and set as primary when the user saves the product.
    if (!this.isEditMode) {
      this.toast.info('Save product first to upload images.');
      return;
    }
    if (!this.primaryImageFile) return;

    // Indicate that the primary selection has changed and will be applied on Save
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
        // After successful update, upload any changed images (edit mode only)
        this.handleImageUploads().subscribe({
          next: () => {
            this.isSaving = false;
            this.router.navigate(['/dashboard/products']);
          },
          error: () => {
            // Image upload errors already handled by ToastService; still navigate
            this.isSaving = false;
            this.router.navigate(['/dashboard/products']);
          },
        });
      },
      error: (err: any) => {
        this.isSaving = false;

        // If backend returned validation errors in ProblemDetails format
        const validation = err?.error?.errors || err?.error?.Errors || null;
        if (validation && typeof validation === 'object') {
          Object.keys(validation).forEach(key => {
            const messages = validation[key] as string[];
            // Map server property name to form control name (Name -> name, CategoryIds -> categoryIds)
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
    // Only used in edit mode. If no files to upload, return observable of null.
    if (!this.isEditMode) return of(null as any);

    const uploads: Array<any> = [];
    this.isUploadingImages = true;

    // Upload primary image first and set as primary
    if (this.primaryImageFile) {
      this.uploadingPrimary = true;
      const primary$ = this.dashboardService.addImage(this.productId!, this.primaryImageFile, { silent: true }).pipe(
        switchMap((res: any) => {
          // Try to infer returned image id
          const imageId = res?.id ?? res?.imageId ?? res?.value?.id ?? null;
          if (imageId) return this.dashboardService.setPrimaryImage(this.productId!, imageId, { silent: true });
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

    // Upload extra images (do not set primary)
    if (this.extraImageFiles.length > 0) {
      const extraUploads = this.extraImageFiles.map((f, idx) =>
        this.dashboardService.addImage(this.productId!, f, { silent: true }).pipe(
          catchError(err => of(null)),
          finalize(() => {
            this.uploadingExtras[idx] = false;
            this.cdr.markForCheck();
          })
        )
      );
      // mark all extras as uploading
      this.uploadingExtras = this.extraImageFiles.map(() => true);
      // Run extra uploads in parallel
      uploads.push(forkJoin(extraUploads));
    }
    // If user changed primary selection for an existing image, enqueue set-primary call
    if (this.primarySelectionChanged && this.desiredPrimaryImageId != null && this.desiredPrimaryImageId !== this.initialPrimaryImageId) {
      uploads.push(this.dashboardService.setPrimaryImage(this.productId!, this.desiredPrimaryImageId, { silent: true }).pipe(catchError(err => of(null))));
    }

    if (uploads.length === 0) {
      this.isUploadingImages = false;
      return of(null as any);
    }

    // Run primary upload (if any) and extras. Use forkJoin to wait for all.
    return forkJoin(uploads as any[]).pipe(
      catchError(err => of(null)),
      finalize(() => {
        this.isUploadingImages = false;
        this.uploadingExtras = [];
        this.uploadingPrimary = false;
        // reset primary change tracking; if desiredPrimaryImageId is null (new upload), preserve initial id
        this.initialPrimaryImageId = this.desiredPrimaryImageId ?? this.initialPrimaryImageId;
        this.primarySelectionChanged = false;
        this.cdr.markForCheck();
        // Show a single toast after batch operations
        this.toast.success('Images updated');
      })
    );
  }

  // Open delete confirmation modal
  deleteConfirmTarget: { id: number | null; url: string; isPrimary: boolean; isProcessing?: boolean } | null = null;
  showDeleteConfirm = false;

  requestSetPrimary(image: { id: number | null; url: string; isPrimary: boolean; isProcessing?: boolean }): void {
    // Deprecated immediate server call. Use selectPrimaryLocally instead.
    this.selectPrimaryLocally(image);
  }

  selectPrimaryLocally(image: { id: number | null; url: string; isPrimary: boolean; isProcessing?: boolean }): void {
    // Update UI only; actual server set-primary will be executed when the product is saved
    this.existingImages.forEach(i => i.isPrimary = (i === image));
    this.primaryImagePreview = image.url;
    this.desiredPrimaryImageId = image.id ?? null;
    this.primarySelectionChanged = this.desiredPrimaryImageId !== this.initialPrimaryImageId;
    this.cdr.markForCheck();
  }

  confirmDeleteExisting(image: { id: number | null; url: string; isPrimary: boolean; isProcessing?: boolean }): void {
    // Show modal confirmation
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
      // local removal
      this.existingImages = this.existingImages.filter(i => i.url !== image.url);
      this.deleteConfirmTarget = null;
      this.cdr.markForCheck();
      return;
    }

    if (image.isProcessing) return;
    image.isProcessing = true;
    this.cdr.markForCheck();

    this.dashboardService.deleteImage(this.productId, image.id, { silent: true }).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(i => i.id !== image.id);
        if (image.isPrimary) this.primaryImagePreview = null;
      },
      error: () => {
        // no extra toast
      },
      complete: () => {
        this.deleteConfirmTarget = null;
        this.cdr.markForCheck();
      },
    });
  }

  deleteExistingImage(image: { id: number | null; url: string; isPrimary: boolean; isProcessing?: boolean }): void {
    if (!this.productId || !image.id) {
      // If no id (url-only), just remove locally
      this.existingImages = this.existingImages.filter(i => i.url !== image.url);
      this.cdr.markForCheck();
      return;
    }

    const confirmDel = window.confirm('Delete this image?');
    if (!confirmDel) return;

    // silent delete: update UI inline and avoid toast spam
    this.dashboardService.deleteImage(this.productId, image.id, { silent: true }).subscribe({
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