// Updated src/App.tsx with role-based routing
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "./store/store";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MemberDashboard from "./pages/member/Dashboard.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminBooks from "./pages/admin/Books.tsx";
import AdminBorrowedBooks from "./pages/admin/BorrowedBooks.tsx";
import MemberBooks from "./pages/member/Books.tsx";
import MemberHistory from "./pages/member/History.tsx";
import RoleRoute from "./components/RoleRoute";
import PrivateRoute from "./components/PrivateRoute";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Member Routes */}
          <Route
            path="/dashboard"
            element={
              <RoleRoute allowedRoles={["member"]}>
                <MemberDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/books"
            element={
              <RoleRoute allowedRoles={["member"]}>
                <MemberBooks />
              </RoleRoute>
            }
          />
          <Route
            path="/history"
            element={
              <RoleRoute allowedRoles={["member"]}>
                <MemberHistory />
              </RoleRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminBooks />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/borrowed-books"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <AdminBorrowedBooks />
              </RoleRoute>
            }
          />

          {/* Default redirect based on auth status */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                {/* This component will determine where to redirect based on user role */}
                <RoleBasedRedirect />
              </PrivateRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </Provider>
  );
}

// Helper component to redirect based on user role
const RoleBasedRedirect = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default App;
