//src/pages/admin/BorrowedBooks.tsx
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Borrow } from "../../types/book";
import { bookService } from "../../services/bookService";
import { useAppToast } from "../../hooks/useToast";
import Navbar from "../../components/Navbar";
import { Loader2, Search } from "lucide-react";

const AdminBorrowedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState<Borrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("borrowed_at_desc"); // Default sort by borrow date desc
  const { showError } = useAppToast();

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      setIsLoading(true);
      const data = await bookService.getBorrowedBooks();
      console.log("📚 Borrowed Books API Response:", data);

      if (Array.isArray(data)) {
        setBorrowedBooks(data);
      } else {
        console.warn("⚠️ Unexpected response format:", data);
        setBorrowedBooks([]);
      }
    } catch (error) {
      showError("Failed to fetch borrowed books");
      console.error(error);
      setBorrowedBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter books based on search term
  const filteredBooks = borrowedBooks.filter(
    (borrow) =>
      borrow.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrow.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort books based on selected option
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "title_asc":
        return a.book_title.localeCompare(b.book_title);
      case "title_desc":
        return b.book_title.localeCompare(a.book_title);
      case "username_asc":
        return a.username.localeCompare(b.username);
      case "username_desc":
        return b.username.localeCompare(a.username);
      case "borrowed_at_asc":
        return (
          new Date(a.borrowed_at).getTime() - new Date(b.borrowed_at).getTime()
        );
      case "borrowed_at_desc":
      default:
        return (
          new Date(b.borrowed_at).getTime() - new Date(a.borrowed_at).getTime()
        );
    }
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Calculate days borrowed
  const calculateDaysBorrowed = (borrowDate: string) => {
    const borrowedDate = new Date(borrowDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - borrowedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Currently Borrowed Books</h1>

        <Card>
          <CardHeader>
            <CardTitle>Active Borrows</CardTitle>
            <CardDescription>
              Books that are currently checked out of the library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by book title or borrower name..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrowed_at_desc">
                      Newest first
                    </SelectItem>
                    <SelectItem value="borrowed_at_asc">
                      Oldest first
                    </SelectItem>
                    <SelectItem value="title_asc">Book title (A-Z)</SelectItem>
                    <SelectItem value="title_desc">Book title (Z-A)</SelectItem>
                    <SelectItem value="username_asc">
                      Borrower name (A-Z)
                    </SelectItem>
                    <SelectItem value="username_desc">
                      Borrower name (Z-A)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sortedBooks.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Borrowed Date</TableHead>
                      <TableHead>Days Out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBooks.map((borrow) => (
                      <TableRow key={borrow.id}>
                        <TableCell className="font-medium">
                          {borrow.book_title}
                        </TableCell>
                        <TableCell>{borrow.username}</TableCell>
                        <TableCell>{formatDate(borrow.borrowed_at)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              calculateDaysBorrowed(borrow.borrowed_at) > 14
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {calculateDaysBorrowed(borrow.borrowed_at)} days
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                {searchTerm
                  ? "No matching borrowed books found."
                  : "No books are currently borrowed."}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminBorrowedBooks;
