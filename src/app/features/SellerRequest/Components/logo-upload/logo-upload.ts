import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-logo-upload',
  imports: [],
  templateUrl: './logo-upload.html',
  styleUrl: './logo-upload.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoUpload {
  next = output<File>();
  prev = output<void>();

  previewUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  error = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Image size must be less than 5MB.');
      return;
    }

    this.error.set(null);
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onNext(): void {
    if (this.selectedFile()) {
      this.next.emit(this.selectedFile()!);
    }
  }

  clearFile(): void {
    this.previewUrl.set(null);
    this.selectedFile.set(null);
    this.error.set(null);
  }
}
