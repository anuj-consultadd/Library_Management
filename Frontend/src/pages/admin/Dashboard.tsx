//src/pages/admin/Dashboard.tsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Navbar from "../../components/Navbar";
import { bookService } from "../../services/bookService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Borrow } from "../../types/book";
import { useAppToast } from "../../hooks/useToast";
import { Book as BookIcon, Users, BookOpen } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useAppToast();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksData, borrowedData] = await Promise.all([
          bookService.getAdminBooks(),
          bookService.getBorrowedBooks(),
        ]);

        if (isMounted) {
          setBooks(Array.isArray(booksData) ? booksData : []);
          setBorrowedBooks(Array.isArray(borrowedData) ? borrowedData : []);
        }
      } catch (error) {
        showError("Failed to fetch dashboard data");
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []); // **Removed `showError` from dependencies to prevent infinite calls**

  const totalBooks = books.length;
  const availableBooks = books.filter((book) => book.available).length;
  const borrowedCount = borrowedBooks.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : totalBooks}
              </div>
              <p className="text-xs text-muted-foreground">
                Books in the library collection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Books
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : availableBooks}
              </div>
              <p className="text-xs text-muted-foreground">
                Books available for borrowing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Books Currently Borrowed
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : borrowedCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Books currently checked out
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recently Added Books</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : books.length > 0 ? (
                <div className="space-y-4">
                  {books.slice(0, 5).map((book) => (
                    <div
                      key={book.id}
                      className="flex justify-between items-center border-b pb-2 last:border-0"
                    >
                      <div>
                        <h3 className="font-medium">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {book.author}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          book.available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {book.available ? "Available" : "Borrowed"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No books available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Borrows</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : borrowedBooks.length > 0 ? (
                <div className="space-y-4">
                  {borrowedBooks.slice(0, 5).map((borrow) => (
                    <div
                      key={borrow.id}
                      className="flex justify-between items-center border-b pb-2 last:border-0"
                    >
                      <div>
                        <h3 className="font-medium">{borrow.book_title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Borrowed by {borrow.username}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(borrow.borrowed_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No books currently borrowed
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
