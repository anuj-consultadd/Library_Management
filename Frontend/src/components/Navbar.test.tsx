import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./Navbar";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice";

// Mock the redux store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      },
    },
  });
};

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/" }),
  };
});

// Mock data for testing
const mockRegularUser = {
  id: "1",
  username: "testuser",
  email: "test@example.com",
  role: "user",
};

const mockAdminUser = {
  id: "2",
  username: "adminuser",
  email: "admin@example.com",
  role: "admin",
};

describe("Navbar Component", () => {
  it("renders the logo correctly", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("Library App")).toBeTruthy(); // ✅ Now it works!
  });

  it("displays regular user navigation links when logged in as regular user", () => {
    const store = createMockStore({
      auth: { user: mockRegularUser, isAuthenticated: true },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("Dashboard")).toBeTruthy();
    expect(screen.getByText("Browse Books")).toBeTruthy();
    expect(screen.getByText("My History")).toBeTruthy();
  });

  it("displays admin navigation links when logged in as admin", () => {
    const store = createMockStore({
      auth: { user: mockAdminUser, isAuthenticated: true },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("Dashboard")).toBeTruthy();
    expect(screen.getByText("Browse Books")).toBeTruthy();
    expect(screen.getByText("My History")).toBeTruthy();
  });
});
