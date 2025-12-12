/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useForm } from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message"

interface ILoginForm {
  email: string,
  password: string
}

const Login = () => {

  const { register, handleSubmit, formState: { errors } } = useForm<ILoginForm>({
    criteriaMode: "all",
  })
  const onSubmit = (data:ILoginForm) => console.log(data)

  return (
    <>
      <Navbar />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="container my-3 py-3">
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
              <div className="text-center">
                <button className="my-2 mx-auto btn btn-dark" type="submit">
                  Login
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