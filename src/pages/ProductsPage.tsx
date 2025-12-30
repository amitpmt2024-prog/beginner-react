import { useSearchParams } from "react-router";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Products from "../components/Products";
import AutoBreadcrumb from "../components/AutoBreadcrumb";
import type { Product } from "../types/Product.type";


const ProductsPage = () => {
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get("category");
    const recentViewed: Product[] = [];
    
    return (<>
        <Navbar />
        <AutoBreadcrumb />
        <Products recentViewed={recentViewed} initialCategory={categoryParam || undefined} />
        <Footer />
    </>);
}

export default ProductsPage;