import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import type { Product } from "../types/Product.type";

import OrderSummary from "./OrderSummary";
import { Controller, useForm } from "react-hook-form";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../Firebase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

type FormValues = {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    address2: string;
    country: string;
    state: string;
    zip: string;
};

// 🔥 Step 1: Reusable validation rules
const validationRules = {
    firstName: {
        required: "First name is required",
    },
    lastName: {
        required: "Last name is required",
    },
    email: {
        required: "Email is required",
        pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Invalid email address",
        },
    },
    address: {
        required: "Address is required",
    },
    address2: {
        required: false,
    },
    country: {
        required: "Please select a valid country",
        validate: (value: string) => value !== "" || "Please select a valid country",
    },
    state: {
        required: "Please provide a valid state",
        validate: (value: string) => value !== "" || "Please provide a valid state",
    },
    zip: {
        required: "Zip code is required",
        pattern: {
            value: /^\d{5,6}$/,
            message: "Please enter a valid zip code (5-6 digits)",
        },
    },
};

const Checkout = () => {
    const state = useSelector((state: { HandleCart: Product[] }) => state.HandleCart || []);
    const navigate = useNavigate();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            address: "",
            address2: "",
            country: "",
            state: "",
            zip: "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            const user = auth.currentUser;
            
            if (!user) {
                toast.error("Please login to place an order");
                navigate("/login");
                return;
            }

            if (state.length === 0) {
                toast.error("Your cart is empty");
                return;
            }

            // Calculate order totals
            let subTotal = 0;
            let totalItems = 0;
            state.forEach((item: Product) => {
                subTotal += (item?.price || 0) * (item.qty ?? 0);
                totalItems += (item.qty ?? 0);
            });
            const shipping = 50;
            const total = subTotal + shipping;

            // Prepare address object
            const address = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                address: data.address,
                address2: data.address2 || "",
                country: data.country,
                state: data.state,
                zip: data.zip,
            };

            // Prepare order object
            const order = {
                userId: user.uid,
                userEmail: user.email || data.email,
                items: state,
                address: address,
                subTotal: Math.round(subTotal),
                shipping: shipping,
                total: Math.round(total),
                totalItems: totalItems,
                status: "pending",
                createdAt: serverTimestamp(),
            };

            // Save order to Firebase
            const orderRef = await addDoc(collection(db, "orders"), order);
            
            toast.success("Order placed successfully!");
            console.log("Order created with ID: ", orderRef.id);
            
            // Optionally navigate to order confirmation page
            // navigate(`/order-confirmation/${orderRef.id}`);
            
        } catch (error) {
            console.error("Error creating order:", error);
            toast.error("Failed to place order. Please try again.");
        }
    };
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
                                <form className="needs-validation" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="row g-3">
                                        <div className="col-sm-6 my-1">
                                            <label className="form-label">
                                                First name
                                            </label>
                                            <Controller
                                                control={control}
                                                name="firstName"
                                                rules={validationRules.firstName}
                                                render={({ field }) => (
                                                    <>
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Enter your name"
                                                        />

                                                        {errors.firstName && (
                                                            <small className="text-danger">
                                                                {errors.firstName.message}
                                                            </small>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        <div className="col-sm-6 my-1">
                                            <label className="form-label">
                                                Last name
                                            </label>
                                            <Controller
                                                control={control}
                                                name="lastName"
                                                rules={validationRules.lastName}
                                                render={({ field }) => (
                                                    <>
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Enter your last name"
                                                        />
                                                        {errors.lastName && (
                                                            <small className="text-danger">
                                                                {errors.lastName.message}
                                                            </small>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        <div className="col-12 my-1">
                                            <label className="form-label">
                                                Email
                                            </label>
                                            <Controller
                                                control={control}
                                                name="email"
                                                rules={validationRules.email}
                                                render={({ field }) => (
                                                    <>
                                                        <input
                                                            {...field}
                                                            type="email"
                                                            className="form-control"
                                                            placeholder="you@example.com"
                                                        />
                                                        {errors.email && (
                                                            <small className="text-danger">
                                                                {errors.email.message}
                                                            </small>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        <div className="col-12 my-1">
                                            <label className="form-label">
                                                Address
                                            </label>
                                            <Controller
                                                control={control}
                                                name="address"
                                                rules={validationRules.address}
                                                render={({ field }) => (
                                                    <>
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="1234 Main St"
                                                        />
                                                        {errors.address && (
                                                            <small className="text-danger">
                                                                {errors.address.message}
                                                            </small>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label">
                                                Address 2{" "}
                                                <span className="text-muted">(Optional)</span>
                                            </label>
                                            <Controller
                                                control={control}
                                                name="address2"
                                                rules={validationRules.address2}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Apartment or suite"
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="col-md-5 my-1">
                                            <label className="form-label">
                                                Country
                                            </label>
                                            <Controller
                                                control={control}
                                                name="country"
                                                rules={validationRules.country}
                                                render={({ field }) => (
                                                    <>
                                                        <select
                                                            {...field}
                                                            className="form-select"
                                                        >
                                                            <option value="">Choose...</option>
                                                            <option value="India">India</option>
                                                        </select>
                                                        {errors.country && (
                                                            <small className="text-danger">
                                                                {errors.country.message}
                                                            </small>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        <div className="col-md-4 my-1">
                                            <label className="form-label">
                                                State
                                            </label>
                                            <Controller
                                                control={control}
                                                name="state"
                                                rules={validationRules.state}
                                                render={({ field }) => (
                                                    <>
                                                        <select
                                                            {...field}
                                                            className="form-select"
                                                        >
                                                            <option value="">Choose...</option>
                                                            <option value="Gujarat">Gujarat</option>
                                                        </select>
                                                        {errors.state && (
                                                            <small className="text-danger">
                                                                {errors.state.message}
                                                            </small>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </div>

                                        <div className="col-md-3 my-1">
                                            <label className="form-label">
                                                Zip
                                            </label>
                                            <Controller
                                                control={control}
                                                name="zip"
                                                rules={validationRules.zip}
                                                render={({ field }) => (
                                                    <>
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Enter zip code"
                                                        />
                                                        {errors.zip && (
                                                            <small className="text-danger">
                                                                {errors.zip.message}
                                                            </small>
                                                        )}
                                                    </>
                                                )}
                                            />
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