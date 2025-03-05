import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, beforeEach, test, expect } from "vitest";
import MemberBooks from "./Books";
import { store } from "../../store/store";
import { bookService } from "../../services/bookService";
import "@testing-library/jest-dom/extend-expect";
import { toast } from "sonner";

//  Mock API Calls
vi.mock("../../services/bookService", () => {
  const mockBooks = [
    { id: 1, title: "Book A", author: "Author A", available: true }, // Available
    { id: 2, title: "Book B", author: "Author B", available: false }, // Unavailable
    { id: 3, title: "Book C", author: "Author C", available: true }, // Available
  ];

  const mockBorrowHistory = [
    {
      id: 1,
      user: 101,
      book: 3,
      book_title: "Book C",
      username: "testuser",
      borrowed_at: "2024-02-20T12:00:00Z",
      returned_at: null, // Book C is still borrowed
    },
  ];

  return {
    bookService: {
      getBooks: vi.fn().mockResolvedValue(mockBooks),
      getBorrowHistory: vi.fn().mockResolvedValue(mockBorrowHistory),
      borrowBook: vi
        .fn()
        .mockResolvedValue({ message: "You have successfully borrowed" }),
      returnBook: vi
        .fn()
        .mockResolvedValue({ message: "You have successfully returned" }),
    },
  };
});

vi.mock("../../components/Navbar", () => ({
  default: () => <div data-testid="mock-navbar" />, // Empty mock component
}));

const renderComponent = () =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <MemberBooks />
      </MemoryRouter>
    </Provider>
  );

describe("MemberBooks Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders correctly and shows loading state initially", async () => {
    renderComponent();
    expect(screen.getByText("Loading books...")).toBeTruthy();
    await waitFor(() => {
      expect(bookService.getBooks).toHaveBeenCalledTimes(1);
      expect(bookService.getBorrowHistory).toHaveBeenCalledTimes(1);
    });
  });

  test("displays fetched books correctly", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Library Books")).toBeTruthy();
    });

    expect(screen.getByText("Book A")).toBeTruthy();
    expect(screen.getByText("Book B")).toBeTruthy();
    expect(screen.getByText("Book C")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByTestId("book-status-1")).toHaveTextContent(
        "Available"
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("book-status-2")).toHaveTextContent(
        "Unavailable"
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("book-status-3")).toHaveTextContent(
        "Borrowed by you"
      );
    });
  });
});

test("allows borrowing a book and updates UI", async () => {
  renderComponent();
  await waitFor(() => {
    expect(screen.getByText("Book A")).toBeTruthy();
  });

  const borrowButton = screen.getByText("Borrow");
  fireEvent.click(borrowButton);
  expect(screen.getByText("Processing...")).toBeTruthy();

  await waitFor(() => {
    expect(bookService.borrowBook).toHaveBeenCalledTimes(1);
    expect(bookService.borrowBook).toHaveBeenCalledWith(1);
  });

  // mocking sonner toast
  vi.mock("sonner", () => ({
    toast: {
      success: vi.fn(),
    },
  }));

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringMatching(/You have successfully borrowed/i)
    );
  });

  await waitFor(() => {
    expect(screen.getByText("Return")).toBeTruthy();
  });
});

test("allows returning a book and updates UI", async () => {
  renderComponent();
  await waitFor(() => {
    expect(screen.getByText("Book B")).toBeTruthy();
  });

  const returnButton = screen.getByText("Return");
  fireEvent.click(returnButton);
  expect(screen.getByText("Processing...")).toBeTruthy();

  await waitFor(() => {
    expect(bookService.returnBook).toHaveBeenCalledTimes(1);
    expect(bookService.returnBook).toHaveBeenCalledWith(3);
  });

  // mocking sonner toast
  vi.mock("sonner", () => ({
    toast: {
      success: vi.fn(),
    },
  }));

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringMatching(/You have successfully returned/i)
    );
  });

  await waitFor(() => {
    expect(screen.getByText("Borrow")).toBeTruthy();
  });
});

test("filters books based on search input", async () => {
  renderComponent();
  await waitFor(() => {
    expect(screen.getByText("Library Books")).toBeTruthy();
  });

  const searchInput = screen.getByPlaceholderText("Search books...");
  fireEvent.change(searchInput, { target: { value: "Book A" } });

  await waitFor(() => {
    expect(screen.getByText("Book A")).toBeTruthy();
    expect(screen.queryByText("Book B")).toBeNull();
    expect(screen.queryByText("Book C")).toBeNull();
  });
});

test("displays a message when no books are available", async () => {
  vi.spyOn(bookService, "getBooks").mockResolvedValue([]);
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText("No books found")).toBeTruthy();
  });

  expect(
    screen.getByText("There are no books available at this time")
  ).toBeTruthy();
});

test("displays a message when no books match search", async () => {
  renderComponent();
  await waitFor(() => {
    expect(screen.getByText("Library Books")).toBeTruthy();
  });

  const searchInput = screen.getByPlaceholderText("Search books...");
  fireEvent.change(searchInput, { target: { value: "Nonexistent Book" } });

  await waitFor(() => {
    expect(screen.getByText("No books found")).toBeTruthy();
  });
});
