import { render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, beforeEach, test, expect } from "vitest";
import MemberDashboard from "./Dashboard";
import { store } from "../../store/store";
import { bookService } from "../../services/bookService";

vi.mock("../../services/bookService", () => ({
  bookService: {
    getBooks: vi.fn().mockResolvedValue([
      { id: 1, title: "Book A", author: "Author A", available: true },
      { id: 2, title: "Book B", author: "Author B", available: false },
      { id: 3, title: "Book C", author: "Author C", available: true },
    ]),
    getBorrowHistory: vi.fn().mockResolvedValue([
      {
        id: 1,
        user: 101,
        book: 2,
        book_title: "Book B",
        username: "testuser",
        borrowed_at: "2024-02-20T12:00:00Z",
        returned_at: null, // Still borrowed
      },
      {
        id: 2,
        user: 102,
        book: 3,
        book_title: "Book C",
        username: "testuser",
        borrowed_at: "2024-02-18T12:00:00Z",
        returned_at: "2024-02-22T12:00:00Z", // Already returned
      },
    ]),
  },
}));

// Utility function to render component
const renderComponent = () => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <MemberDashboard />
      </MemoryRouter>
    </Provider>
  );
};

describe("MemberDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("displays the correct book statistics", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Available Books")).toBeTruthy();
      expect(screen.getByText("Currently Borrowed")).toBeTruthy();
      expect(screen.getByText("Total Borrowed")).toBeTruthy();
    });
    expect(screen.getAllByText("2")).toHaveLength(2);
    expect(screen.getByText("1")).toBeTruthy();
  });

  test("displays borrowed books correctly", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Currently Borrowed Books")).toBeTruthy();
    });

    const borrowedBooksSection = screen.getByTestId("borrowed-books-section");

    expect(within(borrowedBooksSection).getByText("Book B")).toBeTruthy();

    expect(
      within(borrowedBooksSection).getByText((content) =>
        content.includes("2/20/2024")
      )
    ).toBeTruthy();

    expect(within(borrowedBooksSection).getByText("Active")).toBeTruthy();
  });

  test("displays recent borrowing history", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Recent Book History")).toBeTruthy();
    });

    const historySection = screen.getByTestId("recent-history-section");

    expect(within(historySection).getByText("Book C")).toBeTruthy();

    expect(
      within(historySection).getByText((content) =>
        content.includes("2/22/2024")
      )
    ).toBeTruthy();

    expect(within(historySection).getByText("Returned")).toBeTruthy();
  });

  test("handles empty API response gracefully", async () => {
    // Mock API returning empty data
    vi.spyOn(bookService, "getBooks").mockResolvedValue([]);
    vi.spyOn(bookService, "getBorrowHistory").mockResolvedValue([]);
    renderComponent();
    await waitFor(() => {
      expect(screen.getAllByText("0")).toHaveLength(3);
    });

    expect(screen.getByText("No borrowing history")).toBeTruthy();
  });
});
