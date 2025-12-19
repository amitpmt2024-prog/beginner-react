/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { signOut } from 'firebase/auth'
import { auth } from '../Firebase'
import { clearCart } from '../redux/action'
import toast from 'react-hot-toast'

const Navbar = () => {
    const state = useSelector((state: any) => state?.HandleCart || []);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoggedIn = JSON.parse(localStorage.getItem('user') || 'null');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLLIElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('user');
            dispatch(clearCart());
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error: any) {
            console.error('Error logging out:', error);
            toast.error('Error logging out');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light py-3 sticky-top">
            <div className="container">
                <NavLink className="navbar-brand fw-bold fs-4 px-2" to="/"> React Ecommerce</NavLink>
                <button className="navbar-toggler mx-2" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav m-auto my-2 text-center">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/">Home </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/product">Products</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/about">About</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/contact">Contact</NavLink>
                        </li>
                        {isLoggedIn && (
                            <li className="nav-item dropdown" ref={dropdownRef}>
                                <a 
                                    className="nav-link dropdown-toggle" 
                                    href="#" 
                                    id="dropdownMenuButton1" 
                                    role="button" 
                                    aria-expanded={dropdownOpen}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDropdownOpen(!dropdownOpen);
                                    }}
                                >
                                    My Account
                                </a>
                                <ul 
                                    className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`} 
                                    aria-labelledby="dropdownMenuButton1"
                                >
                                    <li>
                                        <NavLink 
                                            className="dropdown-item" 
                                            to="/my-profile"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            My Profile
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink 
                                            className="dropdown-item" 
                                            to="/orders"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Orders
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                        )}
                    </ul>
                    <div className="buttons text-center">
                        <NavLink to="/cart" className="btn btn-outline-dark m-2">
                            <i className="fa fa-cart-shopping mr-1"></i> Cart ({state.length})
                        </NavLink>
                        {!isLoggedIn ? (
                            <>
                                <NavLink to="/login" className="btn btn-outline-dark m-2">
                                    <i className="fa fa-sign-in-alt mr-1"></i> Login
                                </NavLink>
                            </>
                        ) : (
                            <>

                                <button
                                    onClick={handleLogout}
                                    className="btn btn-outline-dark m-2"
                                >
                                    <i className="fa fa-sign-out-alt mr-1"></i> Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>


            </div>
        </nav>
    )
}

export default Navbar