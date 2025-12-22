import { useState } from "react";
import Footer from "../components/Footer";
import Main from "../components/Main";
import Navbar from "../components/Navbar";
import Products from "../components/Products";
import type { Product } from "../types/Product.type";

const Home = () => {
    // Lazy initialization to load from localStorage on mount
    const [recentViewed] = useState<Product[]>(() => {
        try {
            const recentViewedData = localStorage.getItem("recentViewed");
            if (recentViewedData) {
                return JSON.parse(recentViewedData);
            }
        } catch (error) {
            console.error("Error loading recently viewed products:", error);
        }
        return [];
    });
    return (
        <>
            <Navbar />
            <Main />
            <Products recentViewed={recentViewed}/>
            <Footer />
        </>

    );
}

export default Home;