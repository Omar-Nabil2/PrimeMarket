import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../../shared/Services/category-service';
import { ToastService } from '../../../../shared/Services/toast-service';
import { ICategory } from '../../../../shared/Models/Category/icategory';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css',
})
export class AdminCategories implements OnInit, OnDestroy {
  categories: ICategory[] = [];
  filteredCategories: ICategory[] = [];
  searchTerm = '';
  isLoading = false;
  isSubmitting = false;

  addCategoryForm: FormGroup;
  editCategoryForm: FormGroup;

  showAddCategoryForm = false;
  showEditCategoryForm = false;
  showDeleteModal = false;
  selectedCategory: ICategory | null = null;
  categoryToDelete: ICategory | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private toast: ToastService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.addCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.editCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.categories = data || [];
          this.filteredCategories = [...this.categories];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.toast.handleError(err);
          this.cdr.detectChanges();
        },
      });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = [...this.categories];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCategories = this.categories.filter((cat) =>
      cat.name.toLowerCase().includes(term)
    );
  }

  // Add Category
  openAddCategoryForm(): void {
    this.addCategoryForm.reset();
    this.showAddCategoryForm = true;
  }

  closeAddCategoryForm(): void {
    this.showAddCategoryForm = false;
    this.addCategoryForm.reset();
  }

  submitAddCategoryForm(): void {
    if (this.addCategoryForm.invalid) return;

    this.isSubmitting = true;
    const formData = {
      name: this.addCategoryForm.get('name')?.value,
    };

    this.categoryService
      .createCategory(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newCategory) => {
          this.categories.push(newCategory);
          this.filteredCategories = [...this.categories];
          this.toast.success('Category created successfully!');
          this.closeAddCategoryForm();
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toast.handleError(err);
          this.cdr.detectChanges();
        },
      });
  }

  // Edit Category
  openEditCategoryForm(category: ICategory): void {
    this.selectedCategory = category;
    this.editCategoryForm.patchValue({
      name: category.name,
    });
    this.showEditCategoryForm = true;
  }

  closeEditCategoryForm(): void {
    this.showEditCategoryForm = false;
    this.editCategoryForm.reset();
    this.selectedCategory = null;
  }

  submitEditCategoryForm(): void {
    if (this.editCategoryForm.invalid || !this.selectedCategory) return;

    this.isSubmitting = true;
    const formData = {
      name: this.editCategoryForm.get('name')?.value,
    };

    this.categoryService
      .updateCategory(this.selectedCategory.id, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('Category updated successfully!');
          this.closeEditCategoryForm();
          this.isSubmitting = false;
          this.loadCategories();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toast.handleError(err);
          this.cdr.detectChanges();
        },
      });
  }

  // Delete Category
  deleteCategory(category: ICategory): void {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.categoryToDelete = null;
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;

    this.isSubmitting = true;
    const categoryToDelete = this.categoryToDelete;

    this.categoryService
      .deleteCategory(categoryToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.categories = this.categories.filter((c) => c.id !== categoryToDelete.id);
          this.filteredCategories = [...this.categories];
          this.isSubmitting = false;
          this.showDeleteModal = false;
          this.categoryToDelete = null;
          this.cdr.detectChanges();
          this.toast.success('Category deleted successfully!');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.toast.handleError(err);
        },
      });
  }
}
