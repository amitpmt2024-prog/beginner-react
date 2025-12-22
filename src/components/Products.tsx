import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router";
import toast from "react-hot-toast";
import type { Product, ShowProductsProps } from "../types/Product.type";
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


const ShowProducts = ({ filter, data, setFilter, filterProduct }: ShowProductsProps) => {
    const dispatch = useDispatch();
    const addProduct = (product: Product) => {
        dispatch(addCart(product));
    };

    return (
        <>
            <div className="buttons text-center py-5">
                <button
                    className="btn btn-outline-dark btn-sm m-2"
                    onClick={() => setFilter(data)}
                >
                    All
                </button>
                <button
                    className="btn btn-outline-dark btn-sm m-2"
                    onClick={() => filterProduct("men's clothing")}
                >
                    Men's Clothing
                </button>
                <button
                    className="btn btn-outline-dark btn-sm m-2"
                    onClick={() => filterProduct("women's clothing")}
                >
                    Women's Clothing
                </button>
                <button
                    className="btn btn-outline-dark btn-sm m-2"
                    onClick={() => filterProduct("jewelery")}
                >
                    Jewelery
                </button>
                <button
                    className="btn btn-outline-dark btn-sm m-2"
                    onClick={() => filterProduct("electronics")}
                >
                    Electronics
                </button>
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
    const [filter, setFilter] = useState<Product[]>(() =>
        recentViewed && recentViewed.length > 0 ? recentViewed : []
    );
    const [loading, setLoading] = useState<boolean>(() =>
        !(recentViewed && recentViewed.length > 0)
    );

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
                setFilter(json);
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

    const filterProduct = (cat: string) => {
        const updatedList = data.filter((item: Product) => item.category === cat);
        setFilter(updatedList);
    };

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
                    {loading ? <Loading /> : <ShowProducts filter={filter} data={data} setFilter={setFilter} filterProduct={filterProduct} />}
                </div>
            </div>
        </>

    );
}

export default Products;