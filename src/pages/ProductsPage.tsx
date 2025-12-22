import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Products from "../components/Products";
import type { Product } from "../types/Product.type";


const ProductsPage = () => {
    const recentViewed:Product[] = [];
    return (<>
        <Navbar />
        <Products recentViewed={recentViewed}/>
        <Footer />
    </>);
}

export default ProductsPage;