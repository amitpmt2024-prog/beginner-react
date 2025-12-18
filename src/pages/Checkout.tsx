import { useDispatch } from "react-redux";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import type { Product, ProductProps } from "../types/Product.type";
import { addCart } from "../redux/action";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import Skeleton from "react-loading-skeleton";
import toast from "react-hot-toast";

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

const ShowProduct = ({ product }: ProductProps) => {
    const dispatch = useDispatch();
    const addProduct = (product: Product) => {
        dispatch(addCart(product));
    };
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
                    <button className="btn btn-outline-dark" onClick={() => {toast.success("Added to cart");addProduct(product)}}>Add to Cart</button>
                    <Link to="/cart" className="btn btn-dark mx-3">Go to Cart</Link>
                </div>
            </div>

        </div>
    </>);
}

const Checkout = () => {
    const {id} = useParams();
    const [product,setProduct] = useState<Product>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getProduct = async () => {
            setLoading(true);
            const response = await fetch( `https://fakestoreapi.com/products/${id}`);
            setProduct(await response.json());
            setLoading(false);
        }
        getProduct();
    },[id]);

    return (<>
        <Navbar />
        <div className="container my-3 py-3">
            <h1 className="text-center">checkout</h1>
            <hr />
            {loading  ? <Loading /> : <ShowProduct product={product}/>}
        </div>
        <Footer />
    </>);
}


export default Checkout;