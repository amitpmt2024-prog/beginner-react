import { useEffect, useState, useMemo, useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router";
import toast from "react-hot-toast";
import type { Filters, Product, ShowProductsProps } from "../types/Product.type";
import { addCart } from "../redux/action";
import { useDispatch } from "react-redux";

const Loading = () => {
    return (
        <>
            <div className="col-12 py-5 text-center">
                <Skeleton height={40} width={560} />
            </div>
            <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
                <Skeleton height={592} />
            </div>
            <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
                <Skeleton height={592} />
            </div>
            <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
                <Skeleton height={592} />
            </div>
            <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
                <Skeleton height={592} />
            </div>
            <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
                <Skeleton height={592} />
            </div>
            <div className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
                <Skeleton height={592} />
            </div>
        </>
    )
}


const ShowProducts = ({ filter, data, filters, setFilters, onFilterChange }: ShowProductsProps) => {
    const dispatch = useDispatch();
    const addProduct = (product: Product) => {
        dispatch(addCart(product));
    };

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
        <>
            <div className="row py-5">
                <div className="col-12 mb-4">
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
                </div>
            </div>

            {filter.map((product: Product) => {
                return (
                    <div
                        id={product.id}
                        key={product.id}
                        className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4"
                    >
                        <div className="card text-center h-100" key={product.id}>
                            <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                                <img
                                    className="card-img-top p-3"
                                    src={product.image}
                                    alt="Card"
                                    height={300}
                                />

                                <div className="card-body">
                                    <h5 className="card-title">
                                        {product?.title?.substring(0, 12)}...
                                    </h5>
                                    <p className="card-text">
                                        {product?.description?.substring(0, 90)}...
                                    </p>
                                </div>
                            </Link>

                            <ul className="list-group list-group-flush">
                                <li className="list-group-item lead">$ {product.price}</li>
                            </ul>

                            <div className="card-body">
                                <Link
                                    to={`/product/${product.id}`}
                                    className="btn btn-dark m-1"
                                >
                                    Buy Now
                                </Link>

                                <button
                                    className="btn btn-dark m-1"
                                    onClick={() => {
                                        toast.success("Added to cart");
                                        addProduct(product);
                                    }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>

                    </div>
                );
            })}
        </>
    );
};

const Products = ({ recentViewed }: { recentViewed: Product[] }) => {
    // Lazy initialization: use recentViewed if available, otherwise empty array
    const [data, setData] = useState<Product[]>(() =>
        recentViewed && recentViewed.length > 0 ? recentViewed : []
    );
    const [loading, setLoading] = useState<boolean>(() =>
        !(recentViewed && recentViewed.length > 0)
    );

    // Initialize filters state
    const [filters, setFilters] = useState<Filters>(() => {
        const maxPrice = recentViewed && recentViewed.length > 0
            ? Math.max(...recentViewed.map((p) => p.price || 0))
            : 1000;
        return {
            search: null,
            categories: [],
            price: { min: 0, max: maxPrice },
            ratings: [],
        };
    });

    useEffect(() => {
        // Only fetch if we don't have recentViewed data
        if (recentViewed && recentViewed.length > 0) {
            return; // No need to fetch, we already have data
        }

        const controller = new AbortController();

        const getProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch("https://fakestoreapi.com/products/", {
                    signal: controller.signal,
                });
                const json = await response.json();
                setData(json);
                // Update max price in filters when data is loaded
                const maxPrice = Math.max(...json.map((p: Product) => p.price || 0));
                setFilters((prev) => ({
                    ...prev,
                    price: { ...prev.price, max: maxPrice },
                }));
                setLoading(false);
            } catch (error: unknown) {
                if (error instanceof Error && error.name === "AbortError") {
                    console.log("Request aborted");
                } else {
                    setLoading(false);
                }
            }
        };

        getProducts();

        return () => {
            controller.abort(); // cleanup
        };
    }, [recentViewed]);


    // Unified filter function that applies all filters
    const applyFilters = useCallback((products: Product[], currentFilters: Filters): Product[] => {
        return products.filter((product) => {
            // Search filter
            if (currentFilters.search) {
                const searchLower = currentFilters.search.toLowerCase();
                const matchesSearch =
                    product.title?.toLowerCase().includes(searchLower) ||
                    product.description?.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Category filter
            if (currentFilters.categories.length > 0) {
                if (!product.category || !currentFilters.categories.includes(product.category)) {
                    return false;
                }
            }

            // Price filter
            const productPrice = product.price || 0;
            if (
                productPrice < currentFilters.price.min ||
                productPrice > currentFilters.price.max
            ) {
                return false;
            }

            // Rating filter
            if (currentFilters.ratings.length > 0) {
                const productRating = product.rating?.rate || 0;
                const matchesRating = currentFilters.ratings.some(
                    (rating) => productRating >= rating && productRating < rating + 1
                );
                if (!matchesRating) return false;
            }

            return true;
        });
    }, []);

    // Apply filters using useMemo for derived state
    const filteredProducts = useMemo(() => {
        return applyFilters(data, filters);
    }, [data, filters, applyFilters]);

    const handleFilterChange = useCallback(() => {
        // This function is called when filters change in ShowProducts
        // The useMemo above will handle the actual filtering
    }, []);

    return (
        <>
            <div className="container my-3 py-3">
                <div className="row">
                    <div className="col-12">
                        <h2 className="display-5 text-center">{recentViewed && recentViewed.length > 0 ? "Recently Viewed Products" : "Latest Products"}</h2>
                        <hr />
                    </div>
                </div>
                <div className="row justify-content-center">
                    {loading ? (
                        <Loading />
                    ) : (
                        <ShowProducts
                            filter={filteredProducts}
                            data={data}
                            filters={filters}
                            setFilters={setFilters}
                            onFilterChange={handleFilterChange}
                        />
                    )}
                </div>
            </div>
        </>

    );
}

export default Products;