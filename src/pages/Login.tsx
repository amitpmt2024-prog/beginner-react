/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate, useLocation } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AutoBreadcrumb from "../components/AutoBreadcrumb";
import { useForm } from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message"
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db } from "../Firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import {  syncCartToFirebase } from "../redux/reducer/HandleCart";
import { loadCart } from "../redux/action";
import type { Product } from "../types/Product.type";


interface ILoginForm {
  email: string,
  password: string
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm<ILoginForm>({
    criteriaMode: "all",
  })
  
  const onSubmit = async (data: ILoginForm) => {
    try {
      const result: any = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Load user data from Firestore to get name if it exists
      let userName = "";
      try {
        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          userName = userData.name || "";
        }
      } catch (firestoreError) {
        console.error("Error loading user data from Firestore:", firestoreError);
      }

      // Create or update user record in Firestore
      try {
        const userRef = doc(db, "users", result.user.uid);
        await setDoc(
          userRef,
          {
            email: result.user.email,
            uid: result.user.uid,
            isAnonymous: false,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (firestoreError) {
        console.error("Error creating user record in Firestore:", firestoreError);
      }

      const user = {
        uid: result.user.uid,
        email: result.user.email,
        name: userName,
        accessToken: result.user.accessToken,
      };
      localStorage.setItem("user", JSON.stringify(user));

      const cartData = localStorage.getItem('cart');
      if (result.user.uid && cartData) {
        try {
          const cart: Product[] = JSON.parse(cartData);
          if (cart && Array.isArray(cart) && cart.length > 0) {
            // Sync cart to Firebase
            await syncCartToFirebase(result.user.uid, cart);
            // Update Redux store with the cart
            dispatch(loadCart(cart));
          }
        } catch (parseError) {
          console.error("Error parsing cart from localStorage:", parseError);
        }
      }
      
      toast.success("LoggedIn successfully");
      
      // Redirect to the intended page or home
      const redirectPath = (location.state )?.from?.pathname || sessionStorage.getItem("redirectPath") || "/";
      sessionStorage.removeItem("redirectPath");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      if(error instanceof Error && error.name !== "AbortError") {
        toast.error(error.message || "Login failed");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Load user data from Firestore to get name if it exists
      let userName = "";
      try {
        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          userName = userData.name || "";
        }
      } catch (firestoreError) {
        console.error("Error loading user data from Firestore:", firestoreError);
      }

      // Create or update user record in Firestore
      try {
        const userRef = doc(db, "users", result.user.uid);
        await setDoc(
          userRef,
          {
            name: result.user.displayName || userName || "",
            email: result.user.email,
            uid: result.user.uid,
            isAnonymous: false,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (firestoreError) {
        console.error("Error creating user record in Firestore:", firestoreError);
      }
      
      // Save user info to localStorage
      const user = {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || userName || "",
      };
      localStorage.setItem("user", JSON.stringify(user));
      
      // Get cart from localStorage and sync to Firebase if it exists
      const cartData = localStorage.getItem('cart');
      if (result.user.uid && cartData) {
        try {
          const cart: Product[] = JSON.parse(cartData);
          if (cart && Array.isArray(cart) && cart.length > 0) {
            // Sync cart to Firebase
            await syncCartToFirebase(result.user.uid, cart);
            // Update Redux store with the cart
            dispatch(loadCart(cart));
          }
        } catch (parseError) {
          console.error("Error parsing cart from localStorage:", parseError);
        }
      }
      
      toast.success('Signed in with Google successfully');
      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Google sign-in failed");
      }
    }
  };
        

  return (
    <>
      <Navbar />
      <AutoBreadcrumb />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="container py-3">
          <h1 className="text-center">Login</h1>
          <hr />
          <div className="row my-4 h-100">
            <div className="col-md-4 col-lg-4 col-sm-8 mx-auto">
              <div className="my-3">
                <label >Email address</label>
                <input
                  {...register("email", {
                    required: "This is required.",
                    pattern: {
                      value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                      message: 'Please enter a valid email',
                    }
                  })}
                  className="form-control" placeholder="name@example.com" />
                <ErrorMessage
                  errors={errors}
                  name="email"
                  render={({ messages }) =>
                    messages &&
                    Object.entries(messages).map(([type, message]) => (
                      <p key={type} className="errorMessage">{message}</p>
                    ))
                  }
                />

              </div>
              <div className="my-3">
                <label >Password</label>
                <input
                  {...register("password", {
                    required: "This is required.",
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
                      message: 'Please enter a minimum eight characters, at least one letter and one number',
                    }
                  })}
                  className="form-control" placeholder="password" />
                <ErrorMessage
                  errors={errors}
                  name="password"
                  render={({ messages }) =>
                    messages &&
                    Object.entries(messages).map(([type, message]) => (
                      <p key={type} className="errorMessage">{message}</p>
                    ))
                  }
                />
              </div>
              <div className="my-3">
                <p>New Here? <Link to="/register" className="text-decoration-underline text-info">Register</Link> </p>
              </div>
              <div className="d-flex flex-column flex-md-row gap-2 my-3">
                <button 
                  className="btn btn-dark flex-fill" 
                  type="submit"
                >
                  Login
                </button>
                <button 
                  onClick={handleGoogleSignIn} 
                  className="btn btn-outline-secondary flex-fill d-flex align-items-center justify-content-center gap-2"
                  type="button"
                >
                  <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google"
                    width="18"
                    height="18"
                  />
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      <Footer />
    </>
  );
}

export default Login;