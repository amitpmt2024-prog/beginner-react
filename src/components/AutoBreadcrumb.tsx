import { useLocation, Link } from "react-router";
import { useParams, useSearchParams } from "react-router";
import { useState, useEffect } from "react";

interface AutoBreadcrumbProps {
    productCategory?: string;
}

const AutoBreadcrumb = ({ productCategory }: AutoBreadcrumbProps = {}) => {
    const location = useLocation();
    const params = useParams();
    const [searchParams] = useSearchParams();
    const [productName, setProductName] = useState<string>("");

    // Route name mapping
    const routeNames: Record<string, string> = {
        "/product": "Products",
        "/about": "About",
        "/contact": "Contact",
        "/cart": "Cart",
        "/checkout": "Checkout",
        "/login": "Login",
        "/register": "Register",
        "/orders": "Order History",
        "/my-profile": "My Profile",
    };

    // Fetch product name when on product detail page
    useEffect(() => {
        if (location.pathname.startsWith("/product/") && params.id) {
            const fetchProductName = async () => {
                try {
                    const response = await fetch(`https://fakestoreapi.com/products/${params.id}`);
                    const data = await response.json();
                    setProductName(data.title || "Product Details");
                } catch (error) {
                    console.error("Error fetching product name:", error);
                    setProductName("Product Details");
                }
            };
            fetchProductName();
        }
    }, [location.pathname, params.id]);

    // Build breadcrumb items
    const items: Array<{ label: string; path?: string }> = [
        { label: "Home", path: "/" }
    ];

    // Handle product detail page
    if (location.pathname.startsWith("/product/") && params.id) {
        items.push({ label: "Products", path: "/product" });
        if (productCategory) {
            const formattedCategory = productCategory
                .split("'")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join("'");
            items.push({ 
                label: formattedCategory, 
                path: `/product?category=${encodeURIComponent(productCategory)}` 
            });
        }
        items.push({ label: productName || "Product Details" });
    }
    // Handle products page with category
    else if (location.pathname === "/product") {
        const category = searchParams.get("category");
        if (category) {
            const formattedCategory = category
                .split("'")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join("'");
            items.push({ label: "Products", path: "/product" });
            items.push({ label: formattedCategory });
        } else {
            items.push({ label: "Products" });
        }
    }
    // Handle other routes
    else {
        const routeName = routeNames[location.pathname];
        if (routeName) {
            items.push({ label: routeName });
        }
    }

    return (
        <div className="container my-3">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        return (
                            <li key={index} className={`breadcrumb-item ${isLast ? "active" : ""}`}>
                                {isLast || !item.path ? (
                                    <span>{item.label}</span>
                                ) : (
                                    <Link to={item.path} className="text-decoration-none">
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
};

export default AutoBreadcrumb;

