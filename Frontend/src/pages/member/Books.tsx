import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Navbar from "../../components/Navbar";
import { bookService } from "../../services/bookService";
import { Book, Borrow } from "../../types/book";
import { useAppToast } from "../../hooks/useToast";
import { Search, BookOpen, BookX } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MemberBooks = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { showSuccess, showError } = useAppToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksData, historyData] = await Promise.all([
        bookService.getBooks(),
        bookService.getBorrowHistory(),
      ]);

      setBooks(booksData);

      // Ensure historyData is always an array
      const borrowHistory = Array.isArray(historyData) ? historyData : [];

      // Filter only currently borrowed books (not returned)
      setBorrowedBooks(borrowHistory.filter((borrow) => !borrow.returned_at));
    } catch (error) {
      showError("Failed to fetch books data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId: number) => {
    try {
      setActionLoading(bookId);
      const response = await bookService.borrowBook(bookId);
      showSuccess(response.message);

      // Refresh data after borrow
      fetchData();
    } catch (error: any) {
      showError(error.response?.data?.error || "Failed to borrow book");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (bookId: number) => {
    try {
      setActionLoading(bookId);
      const response = await bookService.returnBook(bookId);
      showSuccess(response.message);

      // Refresh data after return
      fetchData();
    } catch (error: any) {
      showError(error.response?.data?.error || "Failed to return book");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter books based on search term
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if a book is currently borrowed by the user
  const isBorrowed = (bookId: number) => {
    return borrowedBooks.some((borrow) => borrow.book === bookId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Library Books</h1>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading books...</p>
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.map((book) => {
                      const borrowed = isBorrowed(book.id);

                      return (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">
                            {book.title}
                          </TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>
                            <span
                              data-testid={`book-status-${book.id}`} // Unique test ID for each book
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                book.available && !borrowed
                                  ? "bg-green-100 text-green-800"
                                  : borrowed
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {book.available && !borrowed
                                ? "Available"
                                : borrowed
                                ? "Borrowed by you"
                                : "Unavailable"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {book.available && !borrowed ? (
                              <Button
                                size="sm"
                                onClick={() => handleBorrow(book.id)}
                                disabled={actionLoading === book.id}
                              >
                                {actionLoading === book.id
                                  ? "Processing..."
                                  : "Borrow"}
                              </Button>
                            ) : borrowed ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReturn(book.id)}
                                disabled={actionLoading === book.id}
                              >
                                {actionLoading === book.id
                                  ? "Processing..."
                                  : "Return"}
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                Unavailable
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <BookX className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No books found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm
                    ? "Try adjusting your search term"
                    : "There are no books available at this time"}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredBooks.length} of {books.length} books
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default MemberBooks;
