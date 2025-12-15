import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Firebase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated
        setIsAuthenticated(true);
        // Also update localStorage for consistency
        const userData = {
          uid: user.uid,
          email: user.email,
        };
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        // User is not authenticated
        setIsAuthenticated(false);
        localStorage.removeItem("user");
        // Save the intended destination for redirect after login
        if (location.pathname !== "/login") {
          sessionStorage.setItem("redirectPath", location.pathname);
        }
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [location.pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;

