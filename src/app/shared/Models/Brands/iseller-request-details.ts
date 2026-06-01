export interface ISellerRequestDetails {
    brandId: number;
    sellerId: string;
    brandName: string;
    description: string | null;
    logoUrl: string | null;
    street: string;
    city: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    applicantFullName: string;
    applicantEmail: string;
    applicantProfilePicture: string | null;
}
