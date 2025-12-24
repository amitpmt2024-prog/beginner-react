import { useDispatch, useSelector } from "react-redux";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import type { Product } from "../types/Product.type";
import { addCart, delCart, delSingleCart } from "../redux/action";
import React, { useEffect } from "react";
import { Link } from "react-router";
import { useCartListener } from "../hooks/useCartListener";
import { fetchCartFromFirebase } from "../redux/reducer/HandleCart";
import { loadCart } from "../redux/action";
import { auth } from "../Firebase";
import OrderSummary from "./OrderSummary";

const EmptyCart = () => {
    return (<>
        <div className="container">
            <div className="row">
                <div className="col-md-12 py-5 bg-light text-center">
                    <h4 className="p-3 display-5">Your Cart is Empty</h4>
                    <Link to="/" className="btn  btn-outline-dark mx-4">
                        <i className="fa fa-arrow-left"></i> Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    </>)
}
const ShowCart = ({ state }: { state: Product[] }) => {
    let subTotal: number = 0;
    // const shipping: number = 50;
    let totalItems: number = 0;
    state.map((item: Product) => {
        subTotal += (item?.price || 0) * (item.qty ?? 0);
        return subTotal;
    })

    state.map((item: Product) => {
        return (totalItems += (item.qty ?? 0));
    })

    const dispatch = useDispatch();
    const addItem = (product: Product) => {
        dispatch(addCart(product));
    };
    const removeItem = (product: Product) => {
        dispatch(delCart(product));
    };

    const removeSingleItem = (product: Product) => {
        dispatch(delSingleCart(product));
    };

    return (<>
        <section className="h-100 gradient-custom">
            <div className="container py-5">
                <div className="row d-flex justify-content-center my-4">
                    <div className="col-md-8">
                        <div className="card mb-4">
                            <div className="card-header py-3">
                                <h5 className="mb-0">Item List</h5>
                            </div>
                            <div className="card-body">
                                {state?.map((item: Product) => {

                                    return (
                                        <React.Fragment key={item.id}>
                                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                                {/* Image */}
                                                <div className="bg-image rounded" data-mdb-ripple-color="light">
                                                    <img src={item.image} alt={item.title} width="100px" height="75px"></img>
                                                </div>

                                                {/* Title */}
                                                <div className="flex-grow-1">
                                                    <strong>{item.title}</strong>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="d-flex align-items-center">
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center"
                                                        onClick={() => removeItem(item)}
                                                        style={{ width: "36px", height: "36px" }}
                                                    >
                                                        <i className="fa fa-minus"></i>
                                                    </button>
                                                    <div className="mx-3 px-3 py-1 border rounded bg-light text-center">
                                                        <strong>{item.qty}</strong>
                                                    </div>
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center"
                                                        onClick={() => addItem(item)}
                                                        style={{ width: "36px", height: "36px" }}
                                                    >
                                                        <i className="fa fa-plus"></i>
                                                    </button>
                                                </div>

                                                {/* Price Display */}
                                                <div className="text-end">
                                                    <small className="text-muted d-block">
                                                        {item.qty} × ${item.price?.toFixed(2)}
                                                    </small>
                                                    <span className="fs-5 fw-bold text-primary">
                                                        ${((item?.qty || 0) * (item?.price || 0)).toFixed(2)}
                                                    </span>
                                                </div>

                                                {/* Remove Button - Last */}
                                                <button 
                                                    className="btn btn-danger btn-sm" 
                                                    onClick={() => removeSingleItem(item)}
                                                >
                                                    <i className="fa fa-trash me-1"></i>
                                                </button>
                                            </div>
                                            <hr className="my-4" />
                                        </React.Fragment>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <OrderSummary state={state} />
                    </div>

                </div>
            </div>
        </section>
    </>)
}

const Cart = () => {
    const state = useSelector((state: { HandleCart: Product[] }) => state?.HandleCart || []);
    const dispatch = useDispatch();

    useCartListener();

    // Also fetch cart on mount to ensure we have the latest data
    useEffect(() => {
        const user = auth.currentUser;
        if (user?.uid) {
            fetchCartFromFirebase(user.uid)
                .then((cart) => {
                    dispatch(loadCart(cart));
                })
                .catch((error) => {
                    console.error("Error fetching cart on mount:", error);
                });
        }
    }, [dispatch]);

    return (<>
        <Navbar />
        <div className="container my-3 py-3">
            <h1 className="text-center">Cart</h1>
            <hr />
            {state?.length > 0 ? <ShowCart state={state} /> : <EmptyCart />}
        </div>
        <Footer />
    </>);
}

export default Cart;