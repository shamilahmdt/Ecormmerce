import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user) {
    // Not logged in
    return <Navigate to="/auth" />;
  }

  if (role && user.role !== role) {
    // Logged in but role mismatch
    return <Navigate to="/not-authorized" />; // redirect to Not Authorized
  }

  return children; // role matches, render component
};

export default ProtectedRoute;