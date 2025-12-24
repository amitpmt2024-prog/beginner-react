import { useState } from "react";
import type { Product } from "../types/Product.type";
import { Link } from "react-router";

const OrderSummary = ({ state }: { state: Product[] }) => {
    let totalItems: number = 0;
    const shipping: number = 50;
    let [subTotal, setSubTotal] = useState(0);
    state.map((item: Product) => {
        subTotal += (item?.price || 0) * (item.qty ?? 0);
        return subTotal;
    })

    state.map((item: Product) => {
        return (totalItems += (item.qty ?? 0));
    })

    const setCouponCode = (code: string) => {
        if(code === "20%OFF") {
          if(subTotal > 100) {
            const discount = subTotal * 0.2;
            setSubTotal(subTotal - discount);
          } 
        } else if(code === "500RS OFF") {
          if(subTotal > 100) {
            const discount = 500;
            setSubTotal(subTotal - discount);
            console.log('aaaaa',subTotal +shipping);
          } 
        } 
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCouponCode(e.target.value);
    }
    
    return (<>
            <div className="card mb-4">
                <div className="card-header py-3 bg-light">
                    <h5 className="mb-0">Order Summary</h5>
                </div>
                <div className="card-body">
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">Products ({totalItems})<span>${Math.round(subTotal)}</span></li>
                        <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">
                            Shipping
                            <span>${shipping}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                            Coupon Code
                            <input type="text" className="form-control" placeholder="Enter coupon code" onChange={handleChange}/>
                        </li>
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