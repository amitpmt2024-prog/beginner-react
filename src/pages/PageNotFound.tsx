import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import AutoBreadcrumb from "../components/AutoBreadcrumb";

const PageNotFound = () => {
  return (
    <>
      <Navbar />
      <AutoBreadcrumb />
      <div className="container py-3">
        <div className="container">
          <div className="row">
            <div className="col-md-12 py-5 bg-light text-center">
              <h4 className="p-3 display-5">404: Page Not Found</h4>
              <Link to="/" className="btn  btn-outline-dark mx-4">
                <i className="fa fa-arrow-left"></i> Go Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageNotFound;
