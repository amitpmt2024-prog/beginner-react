import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProductCategories = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await fetch("https://fakestoreapi.com/products/categories");
                const data = await response.json();
                setCategories(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (category: string) => {
        navigate(`/product?category=${encodeURIComponent(category)}`);
    };

    const formatCategoryName = (category: string) => {
        return category
            .split("'")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("'");
    };

    if (loading) {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-12 mb-4">
                        <Skeleton height={40} />
                    </div>
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="col-md-6 col-lg-3 mb-4">
                            <Skeleton height={200} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-12 text-center mb-5">
                    <h2 className="display-5">Shop by Category</h2>
                    <p className="text-muted">Browse our product categories</p>
                    <hr className="w-50 mx-auto" />
                </div>
            </div>
            <div className="row">
                {categories.map((category) => (
                    <div key={category} className="col-md-6 col-lg-3 mb-4">
                        <div
                            className="card h-100 shadow-sm category-card"
                            style={{
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                            }}
                            onClick={() => handleCategoryClick(category)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-5px)";
                                e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0, 0, 0, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)";
                            }}
                        >
                            <div className="card-body text-center d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                                <div className="mb-3">
                                    <i className="fas fa-tag fa-3x text-primary"></i>
                                </div>
                                <h5 className="card-title mb-0">{formatCategoryName(category)}</h5>
                                <p className="text-muted small mt-2 mb-0">Click to explore</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductCategories;

