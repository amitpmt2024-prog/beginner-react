import { useEffect, useState, useMemo, useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router";
import toast from "react-hot-toast";
import type { Filters, Product } from "../types/Product.type";
import { addCart } from "../redux/action";
import { useDispatch } from "react-redux";
import FilterSidebar from "./FilterSidebar";

const Loading = () => {
    return (
        <div className="row">
            {[...Array(6)].map((_, index) => (
                <div key={index} className="col-md-4 col-sm-6 col-12 mb-4">
                    <Skeleton height={500} />
                </div>
            ))}
        </div>
    )
}


const ShowProducts = ({ filter }: { filter: Product[] }) => {
    const dispatch = useDispatch();
    const addProduct = (product: Product) => {
        dispatch(addCart(product));
    };

    if (filter.length === 0) {
        return (
            <div className="text-center py-5">
                <h4 className="text-muted">No products found</h4>
                <p className="text-muted">Try adjusting your filters to see more results.</p>
            </div>
        );
    }

    return (
        <div className="row">
            {filter.map((product: Product) => {
                return (
                    <div
                        id={product.id}
                        key={product.id}
                        className="col-md-4 col-sm-6 col-12 mb-4"
                    >
                        <div className="card text-center h-100">
                            <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                                <img
                                    className="card-img-top p-3"
                                    src={product.image}
                                    alt={product.title || "Product"}
                                    height={300}
                                    style={{ objectFit: "contain" }}
                                />

                                <div className="card-body">
                                    <h5 className="card-title">
                                        {product?.title?.substring(0, 50)}
                                        {product?.title && product.title.length > 50 ? "..." : ""}
                                    </h5>
                                    <p className="card-text text-muted small">
                                        {product?.description?.substring(0, 90)}
                                        {product?.description && product.description.length > 90 ? "..." : ""}
                                    </p>
                                    {product.rating && (
                                        <div className="mb-2">
                                            <span className="text-warning">
                                                {"⭐".repeat(Math.floor(product.rating.rate || 0))}
                                            </span>
                                            <span className="ms-2 small text-muted">
                                                ({product.rating.rate?.toFixed(1)})
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Link>

                            <ul className="list-group list-group-flush">
                                <li className="list-group-item">
                                    <strong className="h5 text-primary">$ {product.price?.toFixed(2)}</strong>
                                </li>
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
        </div>
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
        <div className="container my-3 py-3">
            <div className="row">
                <div className="col-12">
                    <h2 className="display-5 text-center">
                        {recentViewed && recentViewed.length > 0 ? "Recently Viewed Products" : "Latest Products"}
                    </h2>
                    {!loading && (
                        <p className="text-center text-muted mb-4">
                            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                        </p>
                    )}
                    <hr />
                </div>
            </div>
            <div className="row">
                {/* Left Sidebar - Filters */}
                <div className="col-md-3 col-lg-3 mb-4">
                    {!loading && (
                        <FilterSidebar
                            data={data}
                            filters={filters}
                            setFilters={setFilters}
                            onFilterChange={handleFilterChange}
                        />
                    )}
                </div>

                {/* Right Side - Products */}
                <div className="col-md-9 col-lg-9">
                    {loading ? (
                        <Loading />
                    ) : (
                        <ShowProducts filter={filteredProducts} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Products;