import { Link, useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useForm, Controller } from "react-hook-form";
import {  createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Firebase";
import toast from "react-hot-toast";

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
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
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
       await createUserWithEmailAndPassword(auth, data?.email, data?.password);
       toast.success('User registered successfully');
       navigate("/login");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch(error: any) {
      console.error(error.message);
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
