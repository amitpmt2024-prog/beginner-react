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
                                            <div className="row d-flex align-items-center">
                                                <div className="col-lg-3 col-md-12">
                                                    <div className="bg-image rounded" data-mdb-ripple-color="light">
                                                        <img src={item.image} alt={item.title} width="100px" height="75px"></img>
                                                    </div>
                                                </div>
                                                <div className="col-lg-5 col-md-6">
                                                    <strong>{item.title}</strong>
                                                </div>
                                                <div className="col-lg-4 col-md-6">
                                                    <div
                                                        className="d-flex mb-4"
                                                        style={{ maxWidth: "300px" }}
                                                    >
                                                        <button
                                                            className="btn px-3"
                                                            onClick={() => {
                                                                removeItem(item);
                                                            }}
                                                        >
                                                            {/* <i className="fas fa-minus"></i> */}
                                                            <strong>-</strong>
                                                        </button>
                                                        <p className="mx-5">{item.qty}</p>

                                                        <button
                                                            className="btn px-3"
                                                            onClick={() => {
                                                                addItem(item);
                                                            }}
                                                        >
                                                            {/* <i className="fas fa-plus"></i */}
                                                            <strong>+</strong>
                                                        </button>
                                                        <button className="btn px-2 btn btn-danger" onClick={() => removeSingleItem(item)} >
                                                            Remove
                                                        </button>
                                                    </div>

                                                    <p className="text-start text-md-center">
                                                        <span className="text-muted">{item.qty}</span>{" "}
                                                        x ${item.price} ={" "}
                                                        <span><strong>${(item?.qty || 0) * (item?.price || 0)}</strong></span>
                                                    </p>
                                                </div>
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

    // Set up real-time listener for Firebase cart changes
    // This will automatically update the cart when syncProductToFirebase makes changes
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