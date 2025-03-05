import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Navbar from "../../components/Navbar";
import { bookService } from "../../services/bookService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Borrow } from "../../types/book";
import { useAppToast } from "../../hooks/useToast";
import { BookOpen, History, BookMarked } from "lucide-react";

const MemberDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowHistory, setBorrowHistory] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useAppToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedBooks, fetchedHistory] = await Promise.all([
          bookService.getBooks(),
          bookService.getBorrowHistory(),
        ]);

        setBooks(fetchedBooks);

        // Ensure fetchedHistory is always an array
        setBorrowHistory(Array.isArray(fetchedHistory) ? fetchedHistory : []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const availableBooks = books.filter((book) => book.available).length;
  const currentlyBorrowed = borrowHistory.filter(
    (borrow) => !borrow.returned_at
  ).length;
  const totalBorrowed = borrowHistory.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome, {user?.username}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                Currently Borrowed
              </CardTitle>
              <BookMarked className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : currentlyBorrowed}
              </div>
              <p className="text-xs text-muted-foreground">
                Books you currently have
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Borrowed
              </CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : totalBorrowed}
              </div>
              <p className="text-xs text-muted-foreground">
                Books you've borrowed overall
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Currently Borrowed Books</CardTitle>
            </CardHeader>
            <CardContent data-testid="borrowed-books-section">
              {loading ? (
                <p>Loading...</p>
              ) : borrowHistory.filter((borrow) => !borrow.returned_at).length >
                0 ? (
                <div className="space-y-4">
                  {borrowHistory
                    .filter((borrow) => !borrow.returned_at)
                    .map((borrow) => (
                      <div
                        key={borrow.id}
                        className="flex justify-between items-center border-b pb-2 last:border-0"
                      >
                        <div>
                          <h3 className="font-medium">{borrow.book_title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Borrowed on{" "}
                            {new Date(borrow.borrowed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          Active
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  You don't have any borrowed books
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Book History</CardTitle>
            </CardHeader>
            <CardContent data-testid="recent-history-section">
              {loading ? (
                <p>Loading...</p>
              ) : borrowHistory.length > 0 ? (
                <div className="space-y-4">
                  {borrowHistory
                    .filter((borrow) => borrow.returned_at)
                    .slice(0, 5)
                    .map((borrow) => (
                      <div
                        key={borrow.id}
                        className="flex justify-between items-center border-b pb-2 last:border-0"
                      >
                        <div>
                          <h3 className="font-medium">{borrow.book_title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Returned on{" "}
                            {new Date(borrow.returned_at!).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Returned
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No borrowing history</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;
