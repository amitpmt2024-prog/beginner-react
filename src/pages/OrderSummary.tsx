import type { Product } from "../types/Product.type";
import { Link } from "react-router";

const OrderSummary = ({ state }: { state: Product[] }) => {
    let totalItems: number = 0;
    const shipping: number = 50;
    let subTotal: number = 0;
    state.map((item: Product) => {
        subTotal += (item?.price || 0) * (item.qty ?? 0);
        return subTotal;
    })

    state.map((item: Product) => {
        return (totalItems += (item.qty ?? 0));
    })

    return (<>
        <div className="col-md-4">
            <div className="card mb-4">
                <div className="card-header py-3 bg-light">
                    <h5 className="mb-0">Order Summary</h5>
                </div>
                <div className="card-body">
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">Products ({totalItems})<span>${Math.round(subTotal)}</span></li>
                        <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                            Shipping
                            <span>${shipping}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 mb-3">
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
        </div>
    </>);
}

export default OrderSummary;