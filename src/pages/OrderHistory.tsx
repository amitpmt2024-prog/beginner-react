import { useUserOrders } from "../hooks/useUserOrders";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AutoBreadcrumb from "../components/AutoBreadcrumb";
import type { Order } from "../types/Order.type";
import { Timestamp } from "firebase/firestore";

const OrderHistory = () => {
    const { orders, loading, error } = useUserOrders();

    const formatDate = (timestamp: Timestamp | Date): string => {
        if (timestamp instanceof Timestamp) {
            return timestamp.toDate().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        if (timestamp instanceof Date) {
            return timestamp.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        return "Unknown date";
    };

    const getStatusBadgeClass = (status: Order["status"]): string => {
        console.log(status);
        switch (status) {
            case "delivered":
                return "badge bg-success";
            default:
                return "badge bg-secondary";
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="container my-5">
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading your orders...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="container my-5">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Error!</h4>
                        <p>Failed to load orders: {error.message}</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <AutoBreadcrumb />
            <div className="container my-5">
                <h1 className="text-center mb-4">Order History</h1>
                
                {orders.length === 0 ? (
                    <div className="text-center py-5">
                        <h3>No orders found</h3>
                        <p className="text-muted">You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    <div className="row">
                        {orders.map((order) => (
                            <div key={order.id} className="col-12 mb-4">
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="mb-0">Order #{order.id?.substring(0, 8)}</h5>
                                            <small className="text-muted">
                                                {formatDate(order.createdAt)}
                                            </small>
                                        </div>
                                        <span className={getStatusBadgeClass(order.status)}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6>Shipping Address</h6>
                                                <p className="mb-1">
                                                    {order.address.firstName} {order.address.lastName}
                                                </p>
                                                <p className="mb-1">{order.address.address}</p>
                                                {order.address.address2 && (
                                                    <p className="mb-1">{order.address.address2}</p>
                                                )}
                                                <p className="mb-1">
                                                    {order.address.state} {order.address.zip}
                                                </p>
                                                <p className="mb-0">{order.address.country}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6>Order Summary</h6>
                                                <p className="mb-1">
                                                    <strong>Items:</strong> {order.totalItems}
                                                </p>
                                                <p className="mb-1">
                                                    <strong>Subtotal:</strong> ${order.subTotal}
                                                </p>
                                                <p className="mb-1">
                                                    <strong>Shipping:</strong> ${order.shipping}
                                                </p>
                                                <p className="mb-0">
                                                    <strong>Total:</strong> ${order.total}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <hr />
                                        
                                        <h6>Order Items</h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th>Quantity</th>
                                                        <th>Price</th>
                                                        <th>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.items.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    {item.image && (
                                                                        <img
                                                                            src={item.image}
                                                                            alt={item.title}
                                                                            className="me-2"
                                                                            style={{
                                                                                width: "50px",
                                                                                height: "50px",
                                                                                objectFit: "cover",
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <span>{item.title}</span>
                                                                </div>
                                                            </td>
                                                            <td>{item.qty || 1}</td>
                                                            <td>${item.price || 0}</td>
                                                            <td>
                                                                ${((item.price || 0) * (item.qty || 1)).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default OrderHistory;
