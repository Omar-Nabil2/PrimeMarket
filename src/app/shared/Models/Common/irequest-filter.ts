export interface IRequestFilter {
  pageNumber?: number;
  pageSize?: number;
  searchValue?: string;
  sortColumn?: string;
  sortDirection?: 'ASC' | 'DESC';
}
