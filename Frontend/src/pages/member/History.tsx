import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Navbar from "../../components/Navbar";
import { bookService } from "../../services/bookService";
import { Borrow } from "../../types/book";
import { useAppToast } from "../../hooks/useToast";
import { History, Search, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MemberHistory = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [borrowHistory, setBorrowHistory] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "returned">("all");
  const { showError } = useAppToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const historyData = await bookService.getBorrowHistory();

        // ✅ Ensure historyData is always an array
        setBorrowHistory(Array.isArray(historyData) ? historyData : []);
      } catch (error) {
        showError("Failed to fetch borrowing history");
        console.error(error);
        setBorrowHistory([]); // ✅ Prevents errors if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date to readable string
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate borrowing duration
  const calculateDuration = (
    borrowDate: string,
    returnDate: string | null
  ): string => {
    if (!returnDate) {
      // Book is still borrowed - calculate days from borrow date until now
      const start = new Date(borrowDate);
      const end = new Date();
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days (ongoing)`;
    } else {
      // Book has been returned - calculate days between borrow and return
      const start = new Date(borrowDate);
      const end = new Date(returnDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    }
  };

  // Filter borrow history based on search term and filter
  const filteredHistory = borrowHistory.filter((borrow) => {
    const matchesSearch = borrow.book_title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "active") return matchesSearch && !borrow.returned_at;
    if (filter === "returned") return matchesSearch && !!borrow.returned_at;

    return matchesSearch;
  });

  // Sort history by borrowed_at date (newest first)
  const sortedHistory = [...filteredHistory].sort(
    (a, b) =>
      new Date(b.borrowed_at).getTime() - new Date(a.borrowed_at).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Borrowing History</h1>

          <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              value={filter}
              onValueChange={(value) =>
                setFilter(value as "all" | "active" | "returned")
              }
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                <SelectItem value="active">Currently Borrowed</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Your Borrowing Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading history...</p>
              </div>
            ) : sortedHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Borrowed Date</TableHead>
                      <TableHead>Returned Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedHistory.map((borrow) => (
                      <TableRow key={borrow.id}>
                        <TableCell className="font-medium">
                          {borrow.book_title}
                        </TableCell>
                        <TableCell>{formatDate(borrow.borrowed_at)}</TableCell>
                        <TableCell>{formatDate(borrow.returned_at)}</TableCell>
                        <TableCell>
                          {calculateDuration(
                            borrow.borrowed_at,
                            borrow.returned_at
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              borrow.returned_at
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {borrow.returned_at ? "Returned" : "Active"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No borrowing history</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm || filter !== "all"
                    ? "Try adjusting your search or filter"
                    : "You have not borrowed any books yet"}
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => (window.location.href = "/books")}
                >
                  Browse Books
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MemberHistory;
