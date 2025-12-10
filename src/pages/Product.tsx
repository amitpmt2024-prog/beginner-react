import { Link, useParams } from "react-router";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import Marquee from "react-fast-marquee";

interface Product {
    id: string,
    title: string,
    price: number,
    description: string,
    category: string,
    image: string,
    rating: {
        rate: number,
        count: number
    }
}

const Product = () => {
    const { id } = useParams();
    const [product, setProduct] = useState([]);
    const [similarProducts, setSimilarProduct] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);

    useEffect(() => {
        const getProducts = async () => {
            setLoading(true);
            setLoading2(true);
            const response = await fetch(`https://fakestoreapi.com/products/${id}`);
            const data = await response.json();
            setProduct(data);
            setLoading(false);
            const response2 = await fetch(`https://fakestoreapi.com/products/category/${data.category}`);
            const data2 = await response2.json();
            setSimilarProduct(data2);
            setLoading2(false);
        };

        getProducts();
    }, [id]);

    const Loading = () => {
        return <>
            <div className="container my-5 py-2">
                <div className="row">
                    <div className="col-md-6 py-3">
                        <Skeleton height={400} width={400} />
                    </div>
                    <div className="col-md-6 py-5">
                        <Skeleton height={30} width={250} />
                        <Skeleton height={90} />
                        <Skeleton height={40} width={70} />
                        <Skeleton height={50} width={110} />
                        <Skeleton height={120} />
                        <Skeleton height={40} width={110} inline={true} />
                        <Skeleton className="mx-3" height={40} width={110} />
                    </div>
                </div>
            </div>
        </>
    }

    const ShowProduct = () => {
        return (<>
            <div className="container my-5 py-2">
                <div className="row">
                    <div className="col-md-6 col-sm-12 py-3">
                        <img className="img-fluid" src={product?.image}
                            alt={product?.title} width="400px" height="400px"
                        ></img>
                    </div>
                    <div className="col-md-6 col-md-6 py-5">
                        <h4 className="text-uppercase text-muted">{product?.category}</h4>
                        <h1 className="display-5">{product?.title}</h1>
                        <p className="lead">
                            {product?.rating && product?.rating?.rate}{" "}
                            <i className="fa fa-star"></i>
                        </p>
                        <h3 className="display-6  my-4">
                            {product?.price}
                        </h3>
                        <p className="read">
                            {product?.description}
                        </p>
                        <button className="btn btn-outline-dark">Add to Cart</button>
                        <Link to="/cart" className="btn btn-dark mx-3">Go to Cart</Link>
                    </div>
                </div>

            </div>
        </>);
    }

    const Loading2 = () => {
        return (
            <>
                <div className="my-4 py-4">
                    <div className="d-flex">
                        <div className="mx-4">
                            <Skeleton height={400} width={250} />
                        </div>
                        <div className="mx-4">
                            <Skeleton height={400} width={250} />
                        </div>
                        <div className="mx-4">
                            <Skeleton height={400} width={250} />
                        </div>
                        <div className="mx-4">
                            <Skeleton height={400} width={250} />
                        </div>
                    </div>
                </div>
            </>
        );
    };
    const SimilarProduct = () => {
        return <>
            <div className="py-4 my-4">
                <div className="d-flex">
                    {
                        similarProducts?.map((item: Product) => {
                            return <>
                                <div key={item.id} className="card mx-4 text-center">
                                    <img className="card-img-top p-3" src={item?.image} alt="Card" height="300px" width="300px" />
                                    <div className="card-body">
                                        <h5 className="card-title"> {item.title.substring(0, 15)}...</h5>
                                    </div>
                                    <div className="card-body">
                                        <Link to={"/product/" + item.id} className="btn btn-dark m-1">
                                            Buy Now
                                        </Link>
                                        <button
                                            className="btn btn-dark m-1"
                                        //   onClick={() => addProduct(item)}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>

                                </div>
                            </>
                        })
                    }
                </div>
            </div>
        </>
    }

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="row">{loading ? <Loading /> : <ShowProduct />}</div>
                <div className="row my-5 py-5">
                    <div className="d-none d-md-block">
                        <h2 className="">You may also Like</h2>
                        <Marquee pauseOnClick={true} pauseOnHover={true} speed={50}>
                            {loading2 ? <Loading2 /> : <SimilarProduct />}
                        </Marquee>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Product;