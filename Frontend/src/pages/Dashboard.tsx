import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { logoutUser } from "../store/slices/authSlice";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Library Management Dashboard</h1>
      <p className="mb-4">Welcome back, {user?.username}!</p>
      <p className="mb-4">Role: {user?.role}</p>

      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default Dashboard;
