import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from '../../../../shared/Services/toast-service';
import { UserService, User, CreateUserRequest, UpdateUserRequest } from '../../../../shared/Services/user-service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  currentPage = 1;
  isLoading = false;
  searchTerm = '';
  selectedUser: User | null = null;
  showUserDetails = false;
  showAddUserForm = false;
  showEditUserForm = false;
  isSubmitting = false;

  addUserForm: FormGroup;
  editUserForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.addUserForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roles: [['Customer'], Validators.required]
    });

    this.editUserForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      roles: [['Customer'], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  get totalUsers(): number {
    return this.filteredUsers.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalUsers / this.pageSize));
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get startItemIndex(): number {
    if (this.totalUsers === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItemIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalUsers);
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService
      .getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.users = data;
          this.filteredUsers = data;
          this.currentPage = 1;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastService.error(error?.message || 'Failed to load users');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.users;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(
        (user) =>
          user.email.toLowerCase().includes(term) ||
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          (user.userName && user.userName.toLowerCase().includes(term))
      );
    }

    this.currentPage = 1;
    this.ensureCurrentPageInRange();
  }

  onPageSizeChange(value: string): void {
    this.pageSize = Number(value) || 10;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  onPageChange(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
    this.cdr.detectChanges();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  pageNumbers(maxVisible = 5): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  trackByPage(_: number, page: number): number {
    return page;
  }

  private ensureCurrentPageInRange(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  /**
   * Get full user name (firstName + lastName)
   */
  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  /**
   * Check if user is active (isDisabled = false means active)
   */
  isUserActive(user: User): boolean {
    return !user.isDisabled;
  }

  openAddUserForm(): void {
    this.showAddUserForm = true;
    this.addUserForm.reset({ roles: ['Customer'] });
  }

  closeAddUserForm(): void {
    this.showAddUserForm = false;
    this.addUserForm.reset({ roles: ['Customer'] });
  }

  submitAddUserForm(): void {
    if (this.addUserForm.invalid) {
      this.toastService.error('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;
    const formData: CreateUserRequest = this.addUserForm.value;

    this.userService
      .createUser(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('User created successfully');
          this.closeAddUserForm();
          this.loadUsers();
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastService.error(error?.message || 'Failed to create user');
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
  }

  viewUserDetails(user: User): void {
    this.selectedUser = user;
    this.showUserDetails = true;
  }

  closeUserDetails(): void {
    this.showUserDetails = false;
    this.selectedUser = null;
  }

  openEditUserForm(user: User): void {
    this.selectedUser = user;
    this.editUserForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles || ['Customer']
    });
    this.showEditUserForm = true;
    this.showUserDetails = false;
  }

  closeEditUserForm(): void {
    this.showEditUserForm = false;
    this.selectedUser = null;
    this.editUserForm.reset({ roles: ['Customer'] });
  }

  submitEditUserForm(): void {
    if (!this.selectedUser || this.editUserForm.invalid) {
      this.toastService.error('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;
    const formData: UpdateUserRequest = this.editUserForm.value;

    this.userService
      .updateUser(this.selectedUser.id, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('User updated successfully');
          this.closeEditUserForm();
          this.loadUsers();
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastService.error(error?.message || 'Failed to update user');
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
  }

  toggleUserStatus(user: User): void {
    this.userService
      .toggleUserStatus(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const currentStatus = this.isUserActive(user);
          this.toastService.success(
            currentStatus ? 'User deactivated successfully' : 'User activated successfully'
          );
          this.loadUsers();
        },
        error: (error) => {
          this.toastService.error(error?.message || 'Failed to toggle user status');
        }
      });
  }

  unlockUser(user: User): void {
    if (confirm('Are you sure you want to unlock this user?')) {
      this.userService
        .unlockUser(user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success('User unlocked successfully');
            this.loadUsers();
          },
          error: (error) => {
            this.toastService.error(error?.message || 'Failed to unlock user');
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

