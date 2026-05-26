export interface IBecomeSelerRequest {
  brandName: string;
  description: string | null;
  logo: File;
  street: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}
