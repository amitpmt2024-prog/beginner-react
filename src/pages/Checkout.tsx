import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import type { Product } from "../types/Product.type";

import OrderSummary from "./OrderSummary";

const Checkout = () => {
    const state = useSelector((state: { HandleCart: Product[] }) => state.HandleCart || []);
    return (<>
        <Navbar />
        <div className="container my-3 py-3">
            <h1 className="text-center">Checkout</h1>
            <hr />
            <div className="container py-5">
                <div className="row my-4">
                    
                    <div className="col-md-7 col-lg-8">
                        <div className="card mb-4">
                            <div className="card-header py-3">
                                <h4 className="mb-0">Billing address</h4>
                            </div>
                            <div className="card-body">
                                <form className="needs-validation">
                                    <div className="row g-3">
                                        <div className="col-sm-6 my-1">
                                            <label className="form-label">
                                                First name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="firstName"
                                                placeholder=""
                                                required
                                            />
                                            <div className="invalid-feedback">
                                                Valid first name is required.
                                            </div>
                                        </div>

                                        <div className="col-sm-6 my-1">
                                            <label className="form-label">
                                                Last name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="lastName"
                                                placeholder=""
                                                required
                                            />
                                            <div className="invalid-feedback">
                                                Valid last name is required.
                                            </div>
                                        </div>

                                        <div className="col-12 my-1">
                                            <label className="form-label">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                placeholder="you@example.com"
                                                required
                                            />
                                            <div className="invalid-feedback">
                                                Please enter a valid email address for shipping
                                                updates.
                                            </div>
                                        </div>

                                        <div className="col-12 my-1">
                                            <label className="form-label">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="address"
                                                placeholder="1234 Main St"
                                                required
                                            />
                                            <div className="invalid-feedback">
                                                Please enter your shipping address.
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label">
                                                Address 2{" "}
                                                <span className="text-muted">(Optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="address2"
                                                placeholder="Apartment or suite"
                                            />
                                        </div>

                                        <div className="col-md-5 my-1">
                                            <label className="form-label">
                                                Country
                                            </label>
                                            <br />
                                            <select className="form-select" id="country" required>
                                                <option value="">Choose...</option>
                                                <option>India</option>
                                            </select>
                                            <div className="invalid-feedback">
                                                Please select a valid country.
                                            </div>
                                        </div>

                                        <div className="col-md-4 my-1">
                                            <label className="form-label">
                                                State
                                            </label>
                                            <br />
                                            <select className="form-select" id="state" required>
                                                <option value="">Choose...</option>
                                                <option>Gujarat</option>
                                            </select>
                                            <div className="invalid-feedback">
                                                Please provide a valid state.
                                            </div>
                                        </div>

                                        <div className="col-md-3 my-1">
                                            <label className="form-label">
                                                Zip
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="zip"
                                                placeholder=""
                                                required
                                            />
                                            <div className="invalid-feedback">
                                                Zip code required.
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-4" />
                                    <button
                                        className="w-100 btn btn-primary "
                                        type="submit"
                                    >
                                        Continue to checkout
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5 col-lg-4 order-md">
                        <OrderSummary state={state} />
                    </div>
                </div>
            </div>
        </div>

        <Footer />
    </>);
}


export default Checkout;