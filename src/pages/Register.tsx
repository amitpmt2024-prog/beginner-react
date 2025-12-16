import { Link, useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useForm, Controller } from "react-hook-form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Firebase";
import toast from "react-hot-toast";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const onSubmit = async (data: FormValues) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data?.email, data?.password);
      // User is automatically signed in after registration
      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      };
      localStorage.setItem("user", JSON.stringify(user));
      toast.success('User registered successfully');
      navigate("/");
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error(error.message || "Registration failed");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      console.log("User:", result.user);
    } catch (error) {
      console.error("Google sign-in error:", error);
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

              <button onClick={handleGoogleSignIn} className="google-modern-btn">
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                />
                Continue with Google
              </button>


              <div className="text-center">
                <button className="my-2 mx-auto btn btn-dark" type="submit">
                  Register
                </button>
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
