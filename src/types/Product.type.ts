export interface Product {
    id?: string,
    title?: string,
    price?: number,
    description?: string,
    category?: string,
    image?: string,
    qty?: number,
    rating?: {
        rate?: number,
        count?: number
    }
}

export interface ProductProps {
  product: Product;
}

export interface SimilarProductProps {
  similarProducts: Product[];
}


export interface ShowProductsProps {
    filter: Product[];
    data: Product[];
    filters: Filters;
    setFilters: (filters: Filters) => void;
    onFilterChange: (filters: Filters) => void;
}

export interface Filters {
    search: string | null;
    categories: string[];
    price: {
        min: number;
        max: number;
    };
    ratings: number[];
}