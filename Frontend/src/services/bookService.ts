import { api } from "./api";
import { Book, Borrow } from "../types/book";

export const bookService = {
  // Admin Services
  getAdminBooks: async (): Promise<Book[]> => {
    try {
      const response = await api.get<Book[]>("/api/admin/books/"); 
      console.log("Admin Books Response:", response.data); // Debugging log
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          "Error fetching admin books:",
          (error as any).response?.data || error.message
        );
      } else {
        console.error("Error fetching admin books:", error);
      }
      return [];
    }
  },

  addBook: async (book: Partial<Book> | Partial<Book>[]): Promise<Book[]> => {
    const response = await api.post<{ books: Book[] }>(
      "/api/admin/books/",
      book
    ); // Updated
    return response.data.books;
  },

  updateBook: async (id: number, book: Partial<Book>): Promise<Book> => {
    const response = await api.put<{ book: Book }>(
      `/api/admin/books/${id}/`,
      book
    ); // Updated
    return response.data.book;
  },

  deleteBook: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/books/${id}/`); 
  },

  getBorrowedBooks: async (): Promise<Borrow[]> => {
    try {
      const response = await api.get<Borrow[]>("/api/admin/borrowed-books/");
      console.log("📚 Borrowed Books Response:", response.data);

      // Ensure response is an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(" Error fetching borrowed books:", error);
      return [];
    }
  },

  // Member Services
  getBooks: async (): Promise<Book[]> => {
    try {
      const response = await api.get<Book[]>("/api/books/");
      console.log("📚 User Books Response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        " Error fetching books:",
        (error as any).response?.data || (error as any).message
      );
      return [];
    }
  },

  borrowBook: async (
    id: number
  ): Promise<{ message: string; borrow_details: Borrow }> => {
    const response = await api.post<{
      message: string;
      borrow_details: Borrow;
    }>(`/api/books/${id}/borrow/`); 
    return response.data;
  },

  returnBook: async (
    id: number
  ): Promise<{ message: string; return_details: Borrow }> => {
    const response = await api.post<{
      message: string;
      return_details: Borrow;
    }>(`/api/books/${id}/return/`);
    return response.data;
  },

  getBorrowHistory: async (): Promise<Borrow[]> => {
    try {
      const response = await api.get<Borrow[]>("/api/books/history/");
      console.log("📜 Borrow History Response:", response.data);
      return response.data;
    } catch (error) {
      console.error(" Error fetching borrow history:", error);

      if (error instanceof Error) {
        console.error(" API Error:", (error as any).response);
        console.error(" Error Status:", (error as any).response?.status); 
      }

      return [];
    }
  },
};
