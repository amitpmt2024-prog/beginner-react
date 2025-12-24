import { useState, useMemo, useEffect } from "react";
import type { Product } from "../types/Product.type";
import { Link } from "react-router";

const OrderSummary = ({ state }: { state: Product[] }) => {
    let totalItems: number = 0;
    const shipping: number = 50;
    
    // Calculate base subTotal from state
    const baseSubTotal = useMemo(() => {
        return state.reduce((sum, item) => {
            return sum + (item?.price || 0) * (item.qty ?? 0);
        }, 0);
    }, [state]);
    
    // Load coupon code from localStorage on component mount
    const [couponCode, setCouponCode] = useState(() => {
        const savedCoupon = localStorage.getItem("appliedCouponCode");
        return savedCoupon || "";
    });
    const [showCouponInfo, setShowCouponInfo] = useState(false);

    // Available coupon codes
    const availableCoupons = [
        { code: "20%OFF", description: "20% off on orders above $200", discount: "20%" },
        { code: "500RS OFF", description: "$500 off on orders above $1500", discount: "$500" }
    ];

    state.map((item: Product) => {
        return (totalItems += (item.qty ?? 0));
    })

    // Calculate discount, error message, and applied coupon based on couponCode and baseSubTotal
    const { discount, errorMessage, appliedCoupon } = useMemo(() => {
        const trimmedCode = couponCode.trim().toUpperCase().replace(/\s+/g, ' ');
        
        if (!trimmedCode) {
            return { discount: 0, errorMessage: "", appliedCoupon: "" };
        }

        // Normalize coupon codes for comparison
        const normalizedCode = trimmedCode.replace(/\s+/g, ' ');

        if (normalizedCode === "20%OFF" || normalizedCode === "20% OFF") {
            if (baseSubTotal > 200) {
                const newDiscount = baseSubTotal * 0.2;
                return { discount: newDiscount, errorMessage: "", appliedCoupon: "20%OFF" };
            } else {
                return { 
                    discount: 0, 
                    errorMessage: "Minimum order amount of $200 required for this coupon(Without shipping)", 
                    appliedCoupon: "" 
                };
            }
        } else if (normalizedCode === "500RS OFF" || normalizedCode === "500RSOFF") {
            if (baseSubTotal > 1500) {
                return { discount: 500, errorMessage: "", appliedCoupon: "500RS OFF" };
            } else {
                return { 
                    discount: 0, 
                    errorMessage: "Minimum order amount of $1500 required for this coupon(Without shipping)", 
                    appliedCoupon: "" 
                };
            }
        } else {
            return { 
                discount: 0, 
                errorMessage: "Invalid coupon code. Please check and try again.", 
                appliedCoupon: "" 
            };
        }
    }, [couponCode, baseSubTotal]);

    // Save coupon code to localStorage when it's successfully applied
    useEffect(() => {
        if (appliedCoupon && !errorMessage && couponCode.trim()) {
            // Save only when coupon is successfully applied
            localStorage.setItem("appliedCouponCode", couponCode.trim());
        } else if (!couponCode.trim()) {
            // Remove from localStorage when coupon input is cleared
            localStorage.removeItem("appliedCouponCode");
        }
    }, [appliedCoupon, errorMessage, couponCode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCouponCode(value);
    }

    const subTotal = baseSubTotal - discount;
    
    return (<>
            <div className="card mb-4">
                <div className="card-header py-3 bg-light">
                    <h5 className="mb-0">Order Summary</h5>
                </div>
                <div className="card-body">
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">
                            Products ({totalItems})
                            <span>
                                {discount > 0 ? (
                                    <>
                                        <span style={{ textDecoration: "line-through", color: "#999", marginRight: "8px" }}>
                                            ${Math.round(baseSubTotal)}
                                        </span>
                                        <span className="text-success">${Math.round(subTotal)}</span>
                                    </>
                                ) : (
                                    `$${Math.round(subTotal)}`
                                )}
                            </span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">
                            Shipping
                            <span>${shipping}</span>
                        </li>
                        <li className="list-group-item border-0 px-0">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <span>Coupon Code</span>
                                    <i 
                                        className="fa fa-info-circle text-primary" 
                                        style={{ cursor: "pointer", fontSize: "16px" }}
                                        onMouseEnter={() => setShowCouponInfo(true)}
                                        onMouseLeave={() => setShowCouponInfo(false)}
                                        title="Click to see available coupon codes"
                                    ></i>
                                </div>
                            </div>
                            {showCouponInfo && (
                                <div 
                                    className="alert alert-info py-2 mb-2" 
                                    style={{ fontSize: "12px" }}
                                    onMouseEnter={() => setShowCouponInfo(true)}
                                    onMouseLeave={() => setShowCouponInfo(false)}
                                >
                                    <strong>Available Coupons:</strong>
                                    <ul className="mb-0 mt-1" style={{ paddingLeft: "20px" }}>
                                        {availableCoupons.map((coupon, index) => (
                                            <li key={index}>
                                                <strong>{coupon.code}</strong> - {coupon.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <input 
                                type="text" 
                                className={`form-control ${errorMessage ? 'is-invalid' : appliedCoupon ? 'is-valid' : ''}`}
                                placeholder="Enter coupon code" 
                                value={couponCode}
                                onChange={handleChange}
                            />
                            {errorMessage && (
                                <div className="text-danger mt-1" style={{ fontSize: "12px" }}>
                                    <i className="fa fa-exclamation-circle me-1"></i>
                                    {errorMessage}
                                </div>
                            )}
                            {appliedCoupon && !errorMessage && (
                                <div className="text-success mt-1" style={{ fontSize: "12px" }}>
                                    <i className="fa fa-check-circle me-1"></i>
                                    Coupon "{appliedCoupon}" applied successfully!
                                </div>
                            )}
                        </li>
                        {discount > 0 && (
                            <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">
                                <div className="text-success">
                                    <strong>Discount Applied</strong>
                                </div>
                                <span className="text-success">
                                    <strong>-${Math.round(discount)}</strong>
                                </span>
                            </li>
                        )}
                        <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 mb-2 pb-0">
                            <div>
                                <strong>Total amount</strong>
                            </div>
                            <span>
                                <strong>${Math.round(subTotal + shipping)}</strong>
                            </span>
                        </li>
                    </ul>
                    <Link
                        to="/checkout"
                        className="btn btn-dark btn-lg btn-block"
                    >
                        Go to checkout
                    </Link>
                </div>
            </div>
    </>);
}

export default OrderSummary;