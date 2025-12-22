import { Link, useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useForm, Controller } from "react-hook-form";
import { createUserWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { auth, db } from "../Firebase";
import toast from "react-hot-toast";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { loadCart } from "../redux/action";
import { useDispatch } from "react-redux";
import { syncCartToFirebase } from "../redux/reducer/HandleCart";
import type { Product } from "../types/Product.type";

type FormValues = {
  name: string;
  email: string;
  password: string;
};

// 🔥 Step 1: Reusable validation rules
const validationRules = {
  name: {
    required: "Name is required",
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Invalid email address",
    },
  },
  password: {
    required: "Password is required",
    pattern: {
      value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
      message: "Please enter a minimum eight characters, at least one letter and one number",
    },
  },
};

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const onSubmit = async (data: FormValues) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, data?.email, data?.password);
      // User is automatically signed in after registration
      const user = {
        uid: result.user.uid,
        email: result.user.email,
        name: data.name,
      };
      localStorage.setItem("user", JSON.stringify(user));

      // Create user record in Firestore
      try {
        const userRef = doc(db, "users", result.user.uid);
        await setDoc(
          userRef,
          {
            name: data.name,
            email: result.user.email,
            uid: result.user.uid,
            isAnonymous: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (firestoreError) {
        console.error("Error creating user record in Firestore:", firestoreError);
      }

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
      toast.success('User registered successfully');
      navigate("/");
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error(error.message || "Registration failed");
      }
    }
  };

  const handleAnonymousRegister = async () => {
    try {
      const formData = getValues();
      
      // Validate name is provided
      if (!formData.name || formData.name.trim() === "") {
        toast.error("Please enter your name for anonymous registration");
        return;
      }

      // Sign in anonymously
      const result = await signInAnonymously(auth);
      
      // Create user record in Firestore with name
      const userRef = doc(db, "users", result.user.uid);
      await setDoc(
        userRef,
        {
          name: formData.name,
          email: null,
          uid: result.user.uid,
          isAnonymous: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Save user info to localStorage
      const user = {
        uid: result.user.uid,
        email: "",
        name: formData.name,
        isAnonymous: true,
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

      toast.success('Anonymous registration successful');
      navigate("/");
    } catch (error) {
      console.error("Anonymous registration error:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Anonymous registration failed");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Save user info to localStorage
      const user = {
        uid: result.user.uid,
        email: result.user.email,
      };
      localStorage.setItem("user", JSON.stringify(user));

      // Create or update user record in Firestore
      try {
        const userRef = doc(db, "users", result.user.uid);
        await setDoc(
          userRef,
          {
            name: result.user.displayName || "",
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
      <div className="container my-3 py-3">
        <h1 className="text-center">Register</h1>
        <hr />
        <div className="row my-4 h-100">
          <div className="col-md-4 col-lg-4 col-sm-8 mx-auto">
            <form onSubmit={handleSubmit(onSubmit)}>

              {/* NAME FIELD */}
              <div className="form my-3">
                <label>Full Name</label>
                <Controller
                  name="name"
                  control={control}
                  rules={validationRules.name}
                  render={({ field }) => (
                    <>
                      <input
                        {...field}
                        type="text"
                        className="form-control"
                        placeholder="Enter your name"
                      />
                      {errors.name && (
                        <small className="text-danger">
                          {errors.name.message}
                        </small>
                      )}
                    </>
                  )}
                />
              </div>

              {/* EMAIL FIELD */}
              <div className="form my-3">
                <label>Email Address</label>
                <Controller
                  name="email"
                  control={control}
                  rules={validationRules.email}
                  render={({ field }) => (
                    <>
                      <input
                        {...field}
                        type="email"
                        className="form-control"
                        placeholder="name@example.com"
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

              {/* PASSWORD FIELD */}
              <div className="form my-3">
                <label>Password</label>
                <Controller
                  name="password"
                  control={control}
                  rules={validationRules.password}
                  render={({ field }) => (
                    <>
                      <input
                        {...field}
                        type="password"
                        className="form-control"
                        placeholder="Password"
                      />
                      {errors.password && (
                        <small className="text-danger">
                          {errors.password.message}
                        </small>
                      )}
                    </>
                  )}
                />
              </div>

              <div className="my-3">
                <p>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-decoration-underline text-info"
                  >
                    Login
                  </Link>
                </p>
              </div>
              <div className="d-flex flex-column flex-md-row gap-2 my-3">
                <button 
                  className="btn btn-dark flex-fill" 
                  type="submit"
                >
                  Register
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
              <div className="my-3">
                <button 
                  onClick={handleAnonymousRegister} 
                  className="btn btn-outline-info w-100"
                  type="button"
                >
                  Register Anonymously
                </button>
                <small className="text-muted d-block mt-2">
                  Register without email. Your name will be saved for your profile.
                </small>
              </div>

            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
