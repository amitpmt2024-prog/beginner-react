import { useMemo } from "react";
import type { Filters, Product } from "../types/Product.type";

interface FilterSidebarProps {
    data: Product[];
    filters: Filters;
    setFilters: (filters: Filters) => void;
    onFilterChange: (filters: Filters) => void;
}

const FilterSidebar = ({ data, filters, setFilters, onFilterChange }: FilterSidebarProps) => {
    const categories = useMemo(() => {
        const uniqueCategories = new Set<string>();
        data.forEach((product) => {
            if (product.category) {
                uniqueCategories.add(product.category);
            }
        });
        return Array.from(uniqueCategories);
    }, [data]);

    const maxPrice = useMemo(() => {
        return Math.max(...data.map((p) => p.price || 0));
    }, [data]);

    const handleCategoryToggle = (category: string) => {
        const newCategories = filters.categories.includes(category)
            ? filters.categories.filter((c) => c !== category)
            : [...filters.categories, category];
        const newFilters = { ...filters, categories: newCategories };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSearchChange = (search: string) => {
        const newFilters = { ...filters, search: search || null };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handlePriceChange = (min: number, max: number) => {
        const newFilters = { ...filters, price: { min, max } };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleRatingToggle = (rating: number) => {
        const newRatings = filters.ratings.includes(rating)
            ? filters.ratings.filter((r) => r !== rating)
            : [...filters.ratings, rating];
        const newFilters = { ...filters, ratings: newRatings };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const defaultFilters: Filters = {
            search: null,
            categories: [],
            price: { min: 0, max: maxPrice },
            ratings: [],
        };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    return (
        <div className="card">
            <div className="card-header">
                <h5 className="mb-0">Filters</h5>
            </div>
            <div className="card-body">
                {/* Search */}
                <div className="mb-3">
                    <label className="form-label">Search</label>
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="form-control"
                        value={filters.search || ""}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>

                {/* Categories */}
                <div className="mb-3">
                    <label className="form-label">Categories</label>
                    <div className="d-flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`btn btn-sm ${
                                    filters.categories.includes(category)
                                        ? "btn-dark"
                                        : "btn-outline-dark"
                                }`}
                                onClick={() => handleCategoryToggle(category)}
                            >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div className="mb-3">
                    <label className="form-label">
                        Price Range: ${filters.price.min} - ${filters.price.max}
                    </label>
                    <div className="row">
                        <div className="col-6">
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                placeholder="Min"
                                min="0"
                                max={maxPrice}
                                value={filters.price.min}
                                onChange={(e) =>
                                    handlePriceChange(
                                        Number(e.target.value),
                                        filters.price.max
                                    )
                                }
                            />
                        </div>
                        <div className="col-6">
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                placeholder="Max"
                                min="0"
                                max={maxPrice}
                                value={filters.price.max}
                                onChange={(e) =>
                                    handlePriceChange(
                                        filters.price.min,
                                        Number(e.target.value)
                                    )
                                }
                            />
                        </div>
                    </div>
                    <input
                        type="range"
                        className="form-range mt-2"
                        min="0"
                        max={maxPrice}
                        value={filters.price.max}
                        onChange={(e) =>
                            handlePriceChange(filters.price.min, Number(e.target.value))
                        }
                    />
                </div>

                {/* Ratings */}
                <div className="mb-3">
                    <label className="form-label">Ratings</label>
                    <div className="d-flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                                key={rating}
                                className={`btn btn-sm ${
                                    filters.ratings.includes(rating)
                                        ? "btn-warning"
                                        : "btn-outline-warning"
                                }`}
                                onClick={() => handleRatingToggle(rating)}
                            >
                                {rating}+ ⭐
                            </button>
                        ))}
                    </div>
                </div>

                {/* Clear Filters */}
                <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={clearFilters}
                >
                    Clear All Filters
                </button>
            </div>
        </div>
    );
};

export default FilterSidebar;

