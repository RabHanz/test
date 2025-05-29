interface PaginationOptions {
  pageSize: number;
  initialPage?: number;
}

interface PaginationState<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class Pagination<T> {
  private items: T[];
  private pageSize: number;
  private currentPage: number;

  constructor(items: T[], options: PaginationOptions) {
    this.items = items;
    this.pageSize = options.pageSize;
    this.currentPage = options.initialPage || 1;
  }

  public getCurrentPage(): number {
    return this.currentPage;
  }

  public getPageSize(): number {
    return this.pageSize;
  }

  public getTotalItems(): number {
    return this.items.length;
  }

  public getTotalPages(): number {
    return Math.ceil(this.items.length / this.pageSize);
  }

  public getCurrentPageItems(): T[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.items.slice(startIndex, endIndex);
  }

  public hasNextPage(): boolean {
    return this.currentPage < this.getTotalPages();
  }

  public hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  public nextPage(): boolean {
    if (this.hasNextPage()) {
      this.currentPage++;
      return true;
    }
    return false;
  }

  public previousPage(): boolean {
    if (this.hasPreviousPage()) {
      this.currentPage--;
      return true;
    }
    return false;
  }

  public goToPage(page: number): boolean {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      return true;
    }
    return false;
  }

  public getState(): PaginationState<T> {
    return {
      items: this.getCurrentPageItems(),
      currentPage: this.currentPage,
      totalPages: this.getTotalPages(),
      totalItems: this.getTotalItems(),
      hasNextPage: this.hasNextPage(),
      hasPreviousPage: this.hasPreviousPage(),
    };
  }
}

// Hook for using pagination in React components
export const usePagination = <T>(
  items: T[],
  options: PaginationOptions
): {
  pagination: Pagination<T>;
  currentItems: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => boolean;
  previousPage: () => boolean;
  goToPage: (page: number) => boolean;
} => {
  const pagination = new Pagination(items, options);

  return {
    pagination,
    currentItems: pagination.getCurrentPageItems(),
    currentPage: pagination.getCurrentPage(),
    totalPages: pagination.getTotalPages(),
    totalItems: pagination.getTotalItems(),
    hasNextPage: pagination.hasNextPage(),
    hasPreviousPage: pagination.hasPreviousPage(),
    nextPage: () => pagination.nextPage(),
    previousPage: () => pagination.previousPage(),
    goToPage: (page: number) => pagination.goToPage(page),
  };
}; 